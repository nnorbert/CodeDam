import type { ConfigFormProps, ValidationErrors } from "../../../../../components/ConfigModal";

export type UserInputValueType = "text" | "number";

interface UserInputConfig {
    title: string;
    valueType: UserInputValueType;
}

export function validateUserInputConfig(values: UserInputConfig): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!values.title || !values.title.trim()) {
        errors.title = "Title is required";
    }

    return errors;
}

export function UserInputConfigForm({ values, errors, onChange }: ConfigFormProps<UserInputConfig>) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input Prompt Title
                </label>
                <input
                    type="text"
                    value={values.title || ""}
                    onChange={(e) => onChange({ ...values, title: e.target.value })}
                    placeholder="Enter a value"
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
                    This title will be shown when asking the user for input.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Value Type
                </label>
                <div className="flex gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                        values.valueType === "text"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20"
                            : "border-gray-300 hover:border-gray-400 text-gray-700"
                    }`}>
                        <input
                            type="radio"
                            name="valueType"
                            value="text"
                            checked={values.valueType === "text"}
                            onChange={() => onChange({ ...values, valueType: "text" })}
                            className="sr-only"
                        />
                        <span className="text-lg">📝</span>
                        <span className="font-medium">Text</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                        values.valueType === "number"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20"
                            : "border-gray-300 hover:border-gray-400 text-gray-700"
                    }`}>
                        <input
                            type="radio"
                            name="valueType"
                            value="number"
                            checked={values.valueType === "number"}
                            onChange={() => onChange({ ...values, valueType: "number" })}
                            className="sr-only"
                        />
                        <span className="text-lg">🔢</span>
                        <span className="font-medium">Number</span>
                    </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    {values.valueType === "number" 
                        ? "The input will be converted to a number for calculations."
                        : "The input will be kept as text."}
                </p>
            </div>
        </div>
    );
}

