import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState, useCallback } from "react";

// Types for the modal request
interface ModalRequest {
  title: string;
  placeholder?: string;
  defaultValue?: string;
  valueType?: "text" | "number";
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

  open(
    title: string,
    options?: { placeholder?: string; defaultValue?: string; valueType?: "text" | "number" }
  ): Promise<string | null> {
    return new Promise((resolve) => {
      if (this.listener) {
        this.listener({
          title,
          placeholder: options?.placeholder,
          defaultValue: options?.defaultValue,
          valueType: options?.valueType ?? "text",
          resolve,
        });
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
  const [error, setError] = useState<string | null>(null);

  // Callback ref that focuses the input when it's mounted
  const inputRefCallback = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      // Small delay to ensure the dialog transition has started
      setTimeout(() => node.focus(), 50);
    }
  }, []);

  const validate = useCallback(
    (raw: string): string | null => {
      const trimmed = raw.trim();
      if (!request) return null;
      if (!trimmed) return "Value is required";
      if (request.valueType === "number") {
        const n = Number(trimmed);
        if (!Number.isFinite(n)) return "Please enter a valid number";
      }
      return null;
    },
    [request]
  );

  useEffect(() => {
    const unsubscribe = userInputModal.subscribe((req) => {
      setRequest(req);
      if (req) {
        setInputValue(req.defaultValue ?? "");
        setError(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleSubmit = useCallback(() => {
    if (!request) return;
    const validationError = validate(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    request.resolve(inputValue.trim());
    setRequest(null);
    setInputValue("");
    setError(null);
  }, [request, inputValue, validate]);

  const handleCancel = useCallback(() => {
    if (request) {
      request.resolve(null);
      setRequest(null);
      setInputValue("");
      setError(null);
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
            ref={inputRefCallback}
            type="text"
            inputMode={request?.valueType === "number" ? "decimal" : undefined}
            value={inputValue}
            onChange={(e) => {
              const next = e.target.value;
              setInputValue(next);
              if (request?.valueType === "number") {
                const nextError = validate(next);
                // Don't show "required" while typing; only show numeric format errors
                setError(nextError === "Value is required" ? null : nextError);
              } else if (error) {
                setError(null);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={request?.placeholder ?? "Enter value..."}
            className={`w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20"
            }`}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

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
              onClick={handleSubmit}
              disabled={!inputValue.trim() || !!error}
              className="rounded-lg bttn-gradiant px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Submit
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

