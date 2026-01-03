import type { ConfigFormProps, ValidationErrors } from "../../../../../components/ConfigModal";

/** Maximum number of text components allowed in the text builder */
export const MAX_TEXT_COMPONENTS = 5;

/** Minimum number of text components */
export const MIN_TEXT_COMPONENTS = 2;

// Configuration form values type
export interface TextBuilderConfig extends Record<string, unknown> {
    componentCount: number;
    addSpaces: boolean;
    minAllowedSlots: number; // Passed in to prevent reducing below occupied slots
}

// Configuration form component
export function TextBuilderConfigForm({ values, errors, onChange }: ConfigFormProps<TextBuilderConfig>) {
    const minSlots = values.minAllowedSlots || MIN_TEXT_COMPONENTS;
    
    // Generate options from minSlots to MAX_TEXT_COMPONENTS
    const options: number[] = [];
    for (let i = MIN_TEXT_COMPONENTS; i <= MAX_TEXT_COMPONENTS; i++) {
        options.push(i);
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Text Components
                </label>
                <select
                    value={values.componentCount}
                    onChange={(e) => onChange({ ...values, componentCount: parseInt(e.target.value, 10) })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                    {options.map((num) => (
                        <option key={num} value={num} disabled={num < minSlots}>
                            {num} components{num < minSlots ? " (slots in use)" : ""}
                        </option>
                    ))}
                </select>
                {errors.componentCount && (
                    <p className="mt-1 text-sm text-red-500">{errors.componentCount}</p>
                )}
                {minSlots > MIN_TEXT_COMPONENTS && (
                    <p className="mt-1 text-xs text-amber-600">
                        Cannot reduce below {minSlots} because slots are occupied
                    </p>
                )}
            </div>

            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={values.addSpaces}
                        onChange={(e) => onChange({ ...values, addSpaces: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        Add spaces between components
                    </span>
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                    When checked, a space will be inserted between each text component
                </p>
            </div>
        </div>
    );
}

// Factory function that creates a validator
export function createValidator() {
    return function validateTextBuilderConfig(values: TextBuilderConfig): ValidationErrors {
        const errors: ValidationErrors = {};
        const minSlots = values.minAllowedSlots || MIN_TEXT_COMPONENTS;

        if (values.componentCount < minSlots) {
            errors.componentCount = `Cannot reduce below ${minSlots} components - slots are in use`;
        } else if (values.componentCount < MIN_TEXT_COMPONENTS || values.componentCount > MAX_TEXT_COMPONENTS) {
            errors.componentCount = `Number of components must be between ${MIN_TEXT_COMPONENTS} and ${MAX_TEXT_COMPONENTS}`;
        }

        return errors;
    };
}

