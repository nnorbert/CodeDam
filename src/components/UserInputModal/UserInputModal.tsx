import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState, useCallback } from "react";

// Types for the modal request
interface ModalRequest {
  title: string;
  placeholder?: string;
  resolve: (value: string | null) => void;
}

// Singleton modal manager that can be called from anywhere
class ModalManager {
  private static instance: ModalManager;
  private listener: ((request: ModalRequest | null) => void) | null = null;

  static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  subscribe(callback: (request: ModalRequest | null) => void) {
    this.listener = callback;
    return () => {
      this.listener = null;
    };
  }

  open(title: string, placeholder?: string): Promise<string | null> {
    return new Promise((resolve) => {
      if (this.listener) {
        this.listener({ title, placeholder, resolve });
      } else {
        // No listener registered, resolve with null
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

// Export the singleton instance for external use
export const userInputModal = ModalManager.getInstance();

// The React component that displays the modal
export default function UserInputModal() {
  const [request, setRequest] = useState<ModalRequest | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const unsubscribe = userInputModal.subscribe((req) => {
      setRequest(req);
      if (req) {
        setInputValue("");
      }
    });
    return unsubscribe;
  }, []);

  const handleSubmit = useCallback(() => {
    if (request && inputValue.trim()) {
      request.resolve(inputValue.trim());
      setRequest(null);
      setInputValue("");
    }
  }, [request, inputValue]);

  const handleCancel = useCallback(() => {
    if (request) {
      request.resolve(null);
      setRequest(null);
      setInputValue("");
    }
  }, [request]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && inputValue.trim()) {
        handleSubmit();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSubmit, handleCancel, inputValue]
  );

  return (
    <Dialog open={request !== null} onClose={handleCancel} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
            {request?.title}
          </DialogTitle>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={request?.placeholder ?? "Enter value..."}
            autoFocus
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

