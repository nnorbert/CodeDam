import type { ConfigFormProps, ValidationErrors } from "../../../../../components/ConfigModal";

// Configuration form values type
export interface UseVarConfig extends Record<string, unknown> {
    selectedVariableId: string;
}

// Variable option for the select list
export interface VariableOption {
    id: string;
    name: string;
}

// Configuration form component
export function UseVarConfigForm({
    values,
    errors,
    onChange,
    variables,
}: ConfigFormProps<UseVarConfig> & { variables: VariableOption[] }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Variable
            </label>
            <select
                value={values.selectedVariableId}
                onChange={(e) => onChange({ ...values, selectedVariableId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                autoFocus
            >
                <option value="">-- Select a variable --</option>
                {variables.map((variable) => (
                    <option key={variable.id} value={variable.id}>
                        {variable.name}
                    </option>
                ))}
            </select>
            {errors.selectedVariableId && (
                <p className="mt-1 text-sm text-red-500">{errors.selectedVariableId}</p>
            )}
            {variables.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                    No variables available. Create a variable first.
                </p>
            )}
        </div>
    );
}

// Validation function
export function validateUseVarConfig(values: UseVarConfig): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!values.selectedVariableId) {
        errors.selectedVariableId = "Please select a variable";
    }

    return errors;
}

