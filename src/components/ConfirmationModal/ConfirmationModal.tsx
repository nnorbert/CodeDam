import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState, useCallback } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Types for the modal request
interface ConfirmationRequest {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  resolve: (confirmed: boolean) => void;
}

// Singleton modal manager that can be called from anywhere
class ConfirmationModalManager {
  private static instance: ConfirmationModalManager;
  private listener: ((request: ConfirmationRequest | null) => void) | null = null;

  static getInstance(): ConfirmationModalManager {
    if (!ConfirmationModalManager.instance) {
      ConfirmationModalManager.instance = new ConfirmationModalManager();
    }
    return ConfirmationModalManager.instance;
  }

  subscribe(callback: (request: ConfirmationRequest | null) => void) {
    this.listener = callback;
    return () => {
      this.listener = null;
    };
  }

  confirm(
    title: string,
    options?: {
      message?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: "danger" | "warning" | "info";
    }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.listener) {
        this.listener({
          title,
          message: options?.message,
          confirmLabel: options?.confirmLabel,
          cancelLabel: options?.cancelLabel,
          variant: options?.variant ?? "danger",
          resolve,
        });
      } else {
        // No listener registered, resolve with false
        resolve(false);
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
export const confirmationModal = ConfirmationModalManager.getInstance();

// The React component that displays the modal
export default function ConfirmationModal() {
  const [request, setRequest] = useState<ConfirmationRequest | null>(null);

  useEffect(() => {
    const unsubscribe = confirmationModal.subscribe(setRequest);
    return unsubscribe;
  }, []);

  const handleConfirm = useCallback(() => {
    if (request) {
      request.resolve(true);
      setRequest(null);
    }
  }, [request]);

  const handleCancel = useCallback(() => {
    if (request) {
      request.resolve(false);
      setRequest(null);
    }
  }, [request]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleConfirm();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleConfirm, handleCancel]
  );

  const variantStyles = {
    danger: {
      icon: "text-red-500",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "text-amber-500",
      button: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      icon: "text-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const styles = variantStyles[request?.variant ?? "danger"];

  return (
    <Dialog open={request !== null} onClose={handleCancel} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
        <DialogPanel
          transition
          className="w-full max-w-sm transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 ${styles.icon}`}>
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {request?.title}
              </DialogTitle>
              {request?.message && (
                <p className="mt-2 text-sm text-gray-600">{request.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {request?.cancelLabel ?? "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${styles.button}`}
            >
              {request?.confirmLabel ?? "Confirm"}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

