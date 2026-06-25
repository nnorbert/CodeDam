import { CANVAS_ID } from "../../../utils/constants";
import {
  CURRENT_VERSION,
  PROJECT_FORMAT,
  type CodeDamProjectFile,
} from "./types";

export type ValidateProjectFileResult =
  | { ok: true; file: CodeDamProjectFile }
  | { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateSerializedWidget(data: unknown, path: string, errors: string[]): void {
  if (!isRecord(data)) {
    errors.push(`${path}: expected a widget object.`);
    return;
  }

  if (typeof data.id !== "string" || data.id.length === 0) {
    errors.push(`${path}: widget must have a non-empty "id" string.`);
  }

  if (typeof data.type !== "string" || data.type.length === 0) {
    errors.push(`${path}: widget must have a non-empty "type" string.`);
  }

  if (data.config !== undefined && !isRecord(data.config)) {
    errors.push(`${path}: "config" must be an object when present.`);
  }

  if (data.slots !== undefined) {
    if (!isRecord(data.slots)) {
      errors.push(`${path}: "slots" must be an object when present.`);
    } else {
      for (const [slotName, slotWidget] of Object.entries(data.slots)) {
        validateSerializedWidget(slotWidget, `${path}.slots.${slotName}`, errors);
      }
    }
  }

  if (data.bodies !== undefined) {
    if (!isRecord(data.bodies)) {
      errors.push(`${path}: "bodies" must be an object when present.`);
    } else {
      for (const [bodyName, statements] of Object.entries(data.bodies)) {
        if (!Array.isArray(statements)) {
          errors.push(`${path}.bodies.${bodyName}: expected an array of widgets.`);
          continue;
        }
        statements.forEach((statement, index) => {
          validateSerializedWidget(statement, `${path}.bodies.${bodyName}[${index}]`, errors);
        });
      }
    }
  }
}

function validateSerializedRunner(data: unknown, path: string, errors: string[]): void {
  if (!isRecord(data)) {
    errors.push(`${path}: expected a runner object.`);
    return;
  }

  if (typeof data.id !== "string" || data.id.length === 0) {
    errors.push(`${path}: runner must have a non-empty "id" string.`);
  }

  if (data.kind !== "main" && data.kind !== "function") {
    errors.push(`${path}: runner "kind" must be "main" or "function".`);
  }

  if (!Array.isArray(data.statements)) {
    if (data.statements !== undefined) {
      errors.push(`${path}: runner must have a "statements" array.`);
    }
    return;
  }

  data.statements.forEach((statement, index) => {
    validateSerializedWidget(statement, `${path}.statements[${index}]`, errors);
  });
}

export function validateProjectFile(data: unknown): ValidateProjectFileResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { ok: false, errors: ["Invalid project file: expected a JSON object."] };
  }

  if (data.format !== PROJECT_FORMAT) {
    errors.push(`Unsupported format: expected "${PROJECT_FORMAT}".`);
  }

  if (data.version !== CURRENT_VERSION) {
    errors.push(`Unsupported version: expected ${CURRENT_VERSION}.`);
  }

  if (!isRecord(data.runners)) {
    errors.push('Missing or invalid "runners" object.');
  } else {
    const canvasRunner = data.runners[CANVAS_ID];
    if (canvasRunner) {
      validateSerializedRunner(canvasRunner, `runners.${CANVAS_ID}`, errors);
    }
    // Missing canvas runner is valid — load yields an empty canvas (phase 1).
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, file: data as unknown as CodeDamProjectFile };
}
