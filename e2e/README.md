# Tutorial E2E recordings (Playwright)

These tests drive the on-screen actions from `/tutorial-transcripts` so you can
capture tutorial videos.

Recordings are **1920×1080 WebM at ~12 Mbps** (VP8 via Playwright’s ffmpeg +
CDP screencast). Playwright’s built-in `video: on` is disabled — it downscales
into ~800×800 and hardcodes ~1 Mbps, which looks soft on YouTube.

Output file per run: `test-results/.../tutorial-1080p.webm` (also attached in
the HTML report as `tutorial-1080p`).

## Quick start

```bash
# Install browsers once (includes Playwright’s ffmpeg encoder)
pnpm exec playwright install chromium

# Run all tutorials headed (watch + HQ video)
pnpm test:e2e:record

# One video only
pnpm test:e2e:record e2e/tutorials/02-your-first-program.spec.ts

# Faster dry-run (skips most narration waits)
TUTORIAL_SPEED=4 pnpm test:e2e e2e/tutorials/02-your-first-program.spec.ts
```

Optional: point at your own ffmpeg with `FFMPEG_PATH=/usr/local/bin/ffmpeg`
(Playwright’s cached `ffmpeg-mac` / `ffmpeg-linux` is used by default).

## Recording tips

1. Use **headed** mode (`pnpm test:e2e:record`) if you also want to capture the
   window with OBS/QuickTime. Keep the browser at 1920×1080.
2. Leave `TUTORIAL_SPEED` unset (or `1`) so actions match narration timings.
3. After a run:

   ```bash
   pnpm test:e2e:report
   ```

   or open `test-results/**/tutorial-1080p.webm` directly.

4. Sync the silent capture with the AI narration from each transcript’s
   “Full narration” section.

## Files

| Spec | Transcript |
| --- | --- |
| `01-what-is-codedam.spec.ts` | `01-what-is-codedam.md` |
| `02-your-first-program.spec.ts` | `02-your-first-program.md` |
| `03-statements-and-expressions.spec.ts` | `03-statements-and-expressions.md` |
| `04-variables-and-constants.spec.ts` | `04-variables-and-constants.md` |
| `05-decisions.spec.ts` | `05-decisions.md` |
| `06-loops.spec.ts` | `06-loops.md` |
| `07-save-and-load.spec.ts` | `07-save-and-load.md` |
