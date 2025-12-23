import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState, useCallback } from "react";

// Types for the modal request
interface OutputRequest {
  title: string;
  value: unknown;
  resolve: () => void;
}

// Singleton modal manager that can be called from anywhere
class OutputModalManager {
  private static instance: OutputModalManager;
  private listener: ((request: OutputRequest | null) => void) | null = null;

  static getInstance(): OutputModalManager {
    if (!OutputModalManager.instance) {
      OutputModalManager.instance = new OutputModalManager();
    }
    return OutputModalManager.instance;
  }

  subscribe(callback: (request: OutputRequest | null) => void) {
    this.listener = callback;
    return () => {
      this.listener = null;
    };
  }

  open(title: string, value: unknown): Promise<void> {
    return new Promise((resolve) => {
      if (this.listener) {
        this.listener({ title, value, resolve });
      } else {
        // No listener registered, resolve immediately
        resolve();
      }
    });
  }

  close() {
    if (this.listener) {
      this.listener(null);
    }
  }
}

// Export the singleton instance for external use
export const userOutputModal = OutputModalManager.getInstance();

// Format value for display
function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

// The React component that displays the modal
export default function UserOutputModal() {
  const [request, setRequest] = useState<OutputRequest | null>(null);

  useEffect(() => {
    const unsubscribe = userOutputModal.subscribe((req) => {
      setRequest(req);
    });
    return unsubscribe;
  }, []);

  const handleClose = useCallback(() => {
    if (request) {
      request.resolve();
      setRequest(null);
    }
  }, [request]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  return (
    <Dialog open={request !== null} onClose={handleClose} className="relative z-50">
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
            {request?.title}
          </DialogTitle>

          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-auto max-h-64">
            <pre className="whitespace-pre-wrap break-words text-gray-800">
              {request ? formatValue(request.value) : ""}
            </pre>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              autoFocus
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              OK
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

