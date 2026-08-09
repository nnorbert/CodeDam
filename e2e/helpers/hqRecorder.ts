import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Page } from "@playwright/test";

export const HQ_WIDTH = 1920;
export const HQ_HEIGHT = 1080;

/** JPEG frame quality from Chrome screencast (0–100). */
const FRAME_QUALITY = 95;
/** ~12 Mbps — Playwright’s built-in recorder is hardcoded near 1 Mbps. */
const VIDEO_BITRATE = "12M";
const MIN_BITRATE = "8M";
const MAX_BITRATE = "16M";
const FRAMERATE = 30;
const FRAME_INTERVAL_MS = Math.round(1000 / FRAMERATE);

export type HqRecorder = {
  stop: () => Promise<string | null>;
};

function resolveFfmpegPath(): string | null {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }

  const bases = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(os.homedir(), "Library/Caches/ms-playwright"),
    path.join(os.homedir(), ".cache/ms-playwright"),
  ].filter((value): value is string => Boolean(value));

  const binaryNames = ["ffmpeg-mac", "ffmpeg-linux", "ffmpeg-win64.exe", "ffmpeg"];

  for (const base of bases) {
    if (!fs.existsSync(base)) continue;
    for (const entry of fs.readdirSync(base)) {
      if (!entry.startsWith("ffmpeg-")) continue;
      for (const name of binaryNames) {
        const candidate = path.join(base, entry, name);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }

  return null;
}

/**
 * Record via CDP screencast → Playwright’s ffmpeg (VP8 WebM) at full 1080p / high bitrate.
 * Screencast only emits on paint, so we pump the latest JPEG at a steady 30 fps.
 */
export async function startHqRecorder(page: Page, outputPath: string): Promise<HqRecorder> {
  const ffmpegBin = resolveFfmpegPath();
  if (!ffmpegBin) {
    console.warn(
      "[hq-recorder] No ffmpeg found (Playwright cache or FFMPEG_PATH). Skipping HQ capture.",
    );
    return { stop: async () => null };
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  let ffmpeg: ChildProcessWithoutNullStreams | null = null;
  let lastJpeg: Buffer | null = null;
  let framesWritten = 0;
  let failed = false;
  let pump: ReturnType<typeof setInterval> | null = null;
  const stderrChunks: Buffer[] = [];

  ffmpeg = spawn(
    ffmpegBin,
    [
      "-y",
      "-f",
      "image2pipe",
      "-framerate",
      String(FRAMERATE),
      "-c:v",
      "mjpeg",
      "-i",
      "pipe:0",
      "-an",
      "-c:v",
      "libvpx",
      // Force higher bitrate (no CRF — CQ mode undershoots on flat UI frames)
      "-b:v",
      VIDEO_BITRATE,
      "-minrate",
      MIN_BITRATE,
      "-maxrate",
      MAX_BITRATE,
      "-bufsize",
      "24M",
      "-qmin",
      "1",
      "-qmax",
      "12",
      "-quality",
      "good",
      "-cpu-used",
      "1",
      "-threads",
      "4",
      "-deadline",
      "good",
      outputPath,
    ],
    { stdio: ["pipe", "pipe", "pipe"] },
  );

  ffmpeg.stderr.on("data", (chunk: Buffer) => {
    stderrChunks.push(chunk);
  });

  ffmpeg.on("error", (error) => {
    failed = true;
    console.warn("[hq-recorder] ffmpeg error:", error.message);
  });

  const writeFrame = (jpeg: Buffer) => {
    if (!ffmpeg || failed || ffmpeg.stdin.destroyed) return;
    try {
      ffmpeg.stdin.write(jpeg);
      framesWritten += 1;
    } catch {
      failed = true;
    }
  };

  pump = setInterval(() => {
    if (lastJpeg) writeFrame(lastJpeg);
  }, FRAME_INTERVAL_MS);

  await page.screencast.start({
    size: { width: HQ_WIDTH, height: HQ_HEIGHT },
    quality: FRAME_QUALITY,
    onFrame: (frame) => {
      lastJpeg = frame.data;
    },
  });

  return {
    stop: async () => {
      if (pump) {
        clearInterval(pump);
        pump = null;
      }

      try {
        await page.screencast.stop();
      } catch {
        /* page may already be closed */
      }

      if (!ffmpeg || failed) return null;

      const exitCode = await new Promise<number | null>((resolve) => {
        ffmpeg!.stdin.end();
        ffmpeg!.once("close", (code) => resolve(code));
        setTimeout(() => resolve(null), 90_000);
      });

      if (exitCode !== 0) {
        const errText = Buffer.concat(stderrChunks).toString("utf8").slice(-1200);
        console.warn("[hq-recorder] ffmpeg exited with", exitCode, errText);
        return null;
      }

      if (framesWritten === 0 || !fs.existsSync(outputPath)) {
        return null;
      }
      return outputPath;
    },
  };
}
