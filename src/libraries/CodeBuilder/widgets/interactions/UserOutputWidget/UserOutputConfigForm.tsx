import type { ConfigFormProps, ValidationErrors } from "../../../../../components/ConfigModal";

interface UserOutputConfig {
    title: string;
}

export function validateUserOutputConfig(values: UserOutputConfig): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!values.title || !values.title.trim()) {
        errors.title = "Title is required";
    }

    return errors;
}

export function UserOutputConfigForm({ values, errors, onChange }: ConfigFormProps<UserOutputConfig>) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Modal Title
            </label>
            <input
                type="text"
                value={values.title || ""}
                onChange={(e) => onChange({ ...values, title: e.target.value })}
                placeholder="Output"
                className={`w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.title
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
            />
            {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
                This title will be shown in the output modal header.
            </p>
        </div>
    );
}

