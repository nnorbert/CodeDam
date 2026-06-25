const ILLEGAL_FILENAME_CHARS = /[/\\:*?"<>|]/g;

export function sanitizeFilename(name: string): string {
  return name.trim().replace(ILLEGAL_FILENAME_CHARS, "_").replace(/^\.+|\.+$/g, "");
}

export function validateProjectName(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return "Project name is required";
  }

  if (trimmed.length > 100) {
    return "Project name must be 100 characters or fewer";
  }

  if (ILLEGAL_FILENAME_CHARS.test(trimmed)) {
    return 'Name cannot contain / \\ : * ? " < > |';
  }

  if (trimmed.startsWith(".") || trimmed.endsWith(".")) {
    return "Name cannot start or end with a dot";
  }

  return null;
}
