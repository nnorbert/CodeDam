import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState, useCallback } from "react";

// Types for validation errors - key is field name, value is error message
export type ValidationErrors = Record<string, string>;

// Props passed to the content renderer
export interface ConfigFormProps<T> {
  values: T;
  errors: ValidationErrors;
  onChange: (values: T) => void;
}

// Types for the modal request
interface ConfigRequest<T> {
  title: string;
  initialValues: T;
  validate: (values: T) => ValidationErrors;
  renderContent: (props: ConfigFormProps<T>) => React.ReactNode;
  resolve: (value: T | null) => void;
}

// Using a more flexible type for the manager
type AnyConfigRequest = ConfigRequest<Record<string, unknown>>;

// Singleton modal manager that can be called from anywhere
class ConfigModalManager {
  private static instance: ConfigModalManager;
  private listener: ((request: AnyConfigRequest | null) => void) | null = null;

  static getInstance(): ConfigModalManager {
    if (!ConfigModalManager.instance) {
      ConfigModalManager.instance = new ConfigModalManager();
    }
    return ConfigModalManager.instance;
  }

  subscribe(callback: (request: AnyConfigRequest | null) => void) {
    this.listener = callback;
    return () => {
      this.listener = null;
    };
  }

  open<T extends Record<string, unknown>>(options: {
    title: string;
    initialValues: T;
    validate: (values: T) => ValidationErrors;
    renderContent: (props: ConfigFormProps<T>) => React.ReactNode;
  }): Promise<T | null> {
    return new Promise((resolve) => {
      if (this.listener) {
        this.listener({
          title: options.title,
          initialValues: options.initialValues as Record<string, unknown>,
          validate: options.validate as (values: Record<string, unknown>) => ValidationErrors,
          renderContent: options.renderContent as (props: ConfigFormProps<Record<string, unknown>>) => React.ReactNode,
          resolve: resolve as (value: Record<string, unknown> | null) => void,
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

// Export the singleton instance for external use
export const configModal = ConfigModalManager.getInstance();

// The React component that displays the modal
export default function ConfigModal() {
  const [request, setRequest] = useState<AnyConfigRequest | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const unsubscribe = configModal.subscribe((req) => {
      setRequest(req);
      if (req) {
        setValues(req.initialValues);
        setErrors({});
      }
    });
    return unsubscribe;
  }, []);

  const handleSubmit = useCallback(() => {
    if (!request) return;

    const validationErrors = request.validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      request.resolve(values);
      setRequest(null);
      setValues({});
      setErrors({});
    }
  }, [request, values]);

  const handleCancel = useCallback(() => {
    if (request) {
      request.resolve(null);
      setRequest(null);
      setValues({});
      setErrors({});
    }
  }, [request]);

  const handleChange = useCallback((newValues: Record<string, unknown>) => {
    setValues(newValues);
    // Clear errors when user starts typing
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [errors]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleCancel]
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
            {request?.title}
          </DialogTitle>

          <div className="space-y-4">
            {request?.renderContent({ values, errors, onChange: handleChange })}
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
              onClick={handleSubmit}
              className="rounded-lg bttn-gradiant px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

