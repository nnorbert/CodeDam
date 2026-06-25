/** Stable format identifier for CodeDam project files */
export const PROJECT_FORMAT = "codedam-project" as const;

/** Current supported schema version */
export const CURRENT_VERSION = 1 as const;

export type CodeLanguagePreference = "javascript" | "python";

export type RunnerKind = "main" | "function";

/** Top-level project file */
export interface CodeDamProjectFile {
  format: typeof PROJECT_FORMAT;
  version: typeof CURRENT_VERSION;
  metadata?: {
    name?: string;
    createdAt?: string;
    updatedAt?: string;
    appVersion?: string;
  };
  preferences?: {
    codeLanguage?: CodeLanguagePreference;
  };
  /**
   * One entry per droppable runner (canvas / future function body).
   * Keys are stable runner IDs (e.g. "canvas", "function-greet").
   */
  runners: Record<string, SerializedRunner>;
}

export interface SerializedRunner {
  /** Same as the key in `runners`; redundant but useful when embedding */
  id: string;
  kind: RunnerKind;
  label?: string;
  /** Ordered top-level statements on this runner's canvas */
  statements: SerializedWidget[];
}

export interface SerializedWidget {
  id: string;
  type: string;
  /** Widget-specific settings; omitted when empty */
  config?: Record<string, unknown>;
  /** Expression slots: slot name → widget or omitted when empty */
  slots?: Record<string, SerializedWidget>;
  /**
   * Nested statement lists inside block widgets.
   * Keys are stable body names: then, else, body.
   */
  bodies?: Record<string, SerializedWidget[]>;
}

export function isCodeDamProjectFile(value: unknown): value is CodeDamProjectFile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.format === PROJECT_FORMAT &&
    candidate.version === CURRENT_VERSION &&
    typeof candidate.runners === "object" &&
    candidate.runners !== null &&
    !Array.isArray(candidate.runners)
  );
}
