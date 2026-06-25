import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArrowUpTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CodeDamProjectFile } from "../../libraries/CodeBuilder/persistence/types";
import { validateProjectFile } from "../../libraries/CodeBuilder/persistence/validate";
import { readJsonFile } from "../../utils/fileRead";

const ACCEPTED_EXTENSIONS = [".json", ".codedam", ".codedam.json"];

interface LoadProjectRequest {
  hasExistingProject: boolean;
  resolve: (value: { project: CodeDamProjectFile } | null) => void;
}

class LoadProjectModalManager {
  private static instance: LoadProjectModalManager;
  private listener: ((request: LoadProjectRequest | null) => void) | null = null;

  static getInstance(): LoadProjectModalManager {
    if (!LoadProjectModalManager.instance) {
      LoadProjectModalManager.instance = new LoadProjectModalManager();
    }
    return LoadProjectModalManager.instance;
  }

  subscribe(callback: (request: LoadProjectRequest | null) => void) {
    this.listener = callback;
    return () => {
      this.listener = null;
    };
  }

  open(options?: { hasExistingProject?: boolean }): Promise<{ project: CodeDamProjectFile } | null> {
    return new Promise((resolve) => {
      if (this.listener) {
        this.listener({
          hasExistingProject: options?.hasExistingProject ?? false,
          resolve,
        });
      } else {
        resolve(null);
      }
    });
  }

  close() {
    if (this.listener) {
      this.listener(null);
    }
  }
}

export const loadProjectModal = LoadProjectModalManager.getInstance();

function isAcceptedFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export default function LoadProjectModal() {
  const [request, setRequest] = useState<LoadProjectRequest | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = loadProjectModal.subscribe((req) => {
      setRequest(req);
      if (req) {
        setSelectedFile(null);
        setError(null);
        setIsLoading(false);
        setIsDragOver(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleCancel = useCallback(() => {
    if (request && !isLoading) {
      request.resolve(null);
      setRequest(null);
      setSelectedFile(null);
      setError(null);
    }
  }, [request, isLoading]);

  const selectFile = useCallback((file: File) => {
    if (!isAcceptedFile(file)) {
      setError("Please select a .json or .codedam file.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError(null);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        selectFile(file);
      }
      e.target.value = "";
    },
    [selectFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        selectFile(file);
      }
    },
    [selectFile]
  );

  const handleLoad = useCallback(async () => {
    if (!request || !selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await readJsonFile(selectedFile);
      const validation = validateProjectFile(data);

      if (!validation.ok) {
        setError(validation.errors.join(" "));
        setIsLoading(false);
        return;
      }

      request.resolve({ project: validation.file });
      setRequest(null);
      setSelectedFile(null);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read the selected file.");
      setIsLoading(false);
    }
  }, [request, selectedFile]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleCancel();
      } else if (e.key === "Enter" && selectedFile && !isLoading) {
        handleLoad();
      }
    },
    [handleCancel, handleLoad, isLoading, selectedFile]
  );

  return (
    <Dialog open={request !== null} onClose={handleCancel} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
        <DialogPanel
          transition
          className="w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
            Load project
          </DialogTitle>

          <div className="space-y-4">
            {request?.hasExistingProject && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Loading will replace your current project. This cannot be undone.
              </div>
            )}

            <div
              className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                isDragOver
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-300 bg-gray-50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" aria-hidden="true" />
              <p className="text-sm text-gray-600 mb-3">
                Drag a project file here, or browse to select one.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Browse…
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.codedam,.codedam.json,application/json"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            {selectedFile && (
              <p className="text-sm text-gray-700">
                Selected: <span className="font-mono">{selectedFile.name}</span>
              </p>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLoad}
              disabled={!selectedFile || isLoading}
              className="rounded-lg bttn-gradiant px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isLoading && (
                <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isLoading ? "Loading…" : "Load"}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
