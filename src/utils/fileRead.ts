export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result;
        if (typeof text !== "string") {
          reject(new Error("Could not read file contents."));
          return;
        }
        resolve(JSON.parse(text));
      } catch {
        reject(new Error("Invalid JSON: the file could not be parsed."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the selected file."));
    };

    reader.readAsText(file);
  });
}
