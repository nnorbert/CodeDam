import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useCallback, useEffect, useState } from "react";
import { sanitizeFilename, validateProjectName } from "../../utils/sanitizeFilename";

interface SaveProjectRequest {
  initialName?: string;
  resolve: (value: { name: string } | null) => void;
}

class SaveProjectModalManager {
  private static instance: SaveProjectModalManager;
  private listener: ((request: SaveProjectRequest | null) => void) | null = null;

  static getInstance(): SaveProjectModalManager {
    if (!SaveProjectModalManager.instance) {
      SaveProjectModalManager.instance = new SaveProjectModalManager();
    }
    return SaveProjectModalManager.instance;
  }

  subscribe(callback: (request: SaveProjectRequest | null) => void) {
    this.listener = callback;
    return () => {
      this.listener = null;
    };
  }

  open(options?: { initialName?: string }): Promise<{ name: string } | null> {
    return new Promise((resolve) => {
      if (this.listener) {
        this.listener({
          initialName: options?.initialName,
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

export const saveProjectModal = SaveProjectModalManager.getInstance();

export default function SaveProjectModal() {
  const [request, setRequest] = useState<SaveProjectRequest | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = saveProjectModal.subscribe((req) => {
      setRequest(req);
      if (req) {
        setName(req.initialName ?? "");
        setError(null);
      }
    });
    return unsubscribe;
  }, []);

  const validationError = validateProjectName(name);
  const sanitizedName = sanitizeFilename(name);
  const isValid = validationError === null && sanitizedName.length > 0;

  const handleCancel = useCallback(() => {
    if (request) {
      request.resolve(null);
      setRequest(null);
      setName("");
      setError(null);
    }
  }, [request]);

  const handleSave = useCallback(() => {
    if (!request) return;

    const nameError = validateProjectName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    request.resolve({ name: name.trim() });
    setRequest(null);
    setName("");
    setError(null);
  }, [request, name]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      } else if (e.key === "Enter" && isValid) {
        handleSave();
      }
    },
    [handleCancel, handleSave, isValid]
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
            Save project
          </DialogTitle>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="project-name">
                Project name
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="My first program"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                autoFocus
              />
              {(error || validationError) && (
                <p className="mt-1 text-sm text-red-500">{error ?? validationError}</p>
              )}
            </div>

            {sanitizedName && (
              <p className="text-sm text-gray-500">
                File will be saved as <span className="font-mono">{sanitizedName}.codedam.json</span>
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid}
              className="rounded-lg bttn-gradiant px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
