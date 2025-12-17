import { useState } from "react";
import type { ConfigFormProps, ValidationErrors } from "../../../../../components/ConfigModal";

// Tab types
type ValueTab = "number" | "text" | "boolean" | "empty";

// Empty value options
type EmptyValue = "null" | "undefined" | "zero" | "emptyString";

// Configuration form values type
export interface UsePrimitiveValueConfig extends Record<string, unknown> {
    activeTab: ValueTab;
    numberValue: string;
    textValue: string;
    booleanValue: boolean | null;
    emptyValue: EmptyValue | null;
}

// Get the actual value based on config
export function getValueFromConfig(config: UsePrimitiveValueConfig): string | number | boolean | null | undefined {
    switch (config.activeTab) {
        case "number":
            return parseFloat(config.numberValue);
        case "text":
            return config.textValue;
        case "boolean":
            return config.booleanValue;
        case "empty":
            switch (config.emptyValue) {
                case "null": return null;
                case "undefined": return undefined;
                case "zero": return 0;
                case "emptyString": return "";
                default: return null;
            }
        default:
            return null;
    }
}

// Get initial config from an existing value
// Pass isExistingValue=true when editing an existing widget to preserve null/undefined as "empty" tab
export function getConfigFromValue(value: string | number | boolean | null | undefined, isExistingValue = false): UsePrimitiveValueConfig {
    // For new widgets (null and not explicitly set), default to text tab
    if (value === null && !isExistingValue) {
        return { activeTab: "text", numberValue: "", textValue: "", booleanValue: null, emptyValue: null };
    }
    if (value === null) {
        return { activeTab: "empty", numberValue: "", textValue: "", booleanValue: null, emptyValue: "null" };
    }
    if (value === undefined) {
        return { activeTab: "empty", numberValue: "", textValue: "", booleanValue: null, emptyValue: "undefined" };
    }
    if (value === 0) {
        return { activeTab: "number", numberValue: "0", textValue: "", booleanValue: null, emptyValue: null };
    }
    if (value === "") {
        return { activeTab: "empty", numberValue: "", textValue: "", booleanValue: null, emptyValue: "emptyString" };
    }
    if (typeof value === "number") {
        return { activeTab: "number", numberValue: String(value), textValue: "", booleanValue: null, emptyValue: null };
    }
    if (typeof value === "boolean") {
        return { activeTab: "boolean", numberValue: "", textValue: "", booleanValue: value, emptyValue: null };
    }
    if (typeof value === "string") {
        return { activeTab: "text", numberValue: "", textValue: value, booleanValue: null, emptyValue: null };
    }
    return { activeTab: "text", numberValue: "", textValue: "", booleanValue: null, emptyValue: null };
}

const tabs: { id: ValueTab; label: string }[] = [
    { id: "text", label: "Text" },
    { id: "number", label: "Number" },
    { id: "boolean", label: "Boolean" },
    { id: "empty", label: "Empty" },
];

// Configuration form component
export function UsePrimitiveValueConfigForm({ values, errors, onChange }: ConfigFormProps<UsePrimitiveValueConfig>) {
    const [activeTab, setActiveTab] = useState<ValueTab>(values.activeTab);

    const handleTabChange = (tab: ValueTab) => {
        setActiveTab(tab);
        onChange({ ...values, activeTab: tab });
    };

    return (
        <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? "text-indigo-600 border-b-2 border-indigo-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="min-h-24">
                {activeTab === "number" && (
                    <NumberForm values={values} errors={errors} onChange={onChange} />
                )}
                {activeTab === "text" && (
                    <TextForm values={values} errors={errors} onChange={onChange} />
                )}
                {activeTab === "boolean" && (
                    <BooleanForm values={values} errors={errors} onChange={onChange} />
                )}
                {activeTab === "empty" && (
                    <EmptyForm values={values} errors={errors} onChange={onChange} />
                )}
            </div>
        </div>
    );
}

// Number form
function NumberForm({ values, errors, onChange }: ConfigFormProps<UsePrimitiveValueConfig>) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Number Value
            </label>
            <input
                type="text"
                value={values.numberValue}
                onChange={(e) => onChange({ ...values, numberValue: e.target.value })}
                placeholder="e.g. 42 or 3.14"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                autoFocus
            />
            {errors.numberValue && (
                <p className="mt-1 text-sm text-red-500">{errors.numberValue}</p>
            )}
        </div>
    );
}

// Text form
function TextForm({ values, errors, onChange }: ConfigFormProps<UsePrimitiveValueConfig>) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Value
            </label>
            <input
                type="text"
                value={values.textValue}
                onChange={(e) => onChange({ ...values, textValue: e.target.value })}
                placeholder="Enter text..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                autoFocus
            />
            {errors.textValue && (
                <p className="mt-1 text-sm text-red-500">{errors.textValue}</p>
            )}
        </div>
    );
}

// Boolean form
function BooleanForm({ values, errors, onChange }: ConfigFormProps<UsePrimitiveValueConfig>) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Boolean Value
            </label>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="booleanValue"
                        checked={values.booleanValue === true}
                        onChange={() => onChange({ ...values, booleanValue: true })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">True</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="booleanValue"
                        checked={values.booleanValue === false}
                        onChange={() => onChange({ ...values, booleanValue: false })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">False</span>
                </label>
            </div>
            {errors.booleanValue && (
                <p className="mt-1 text-sm text-red-500">{errors.booleanValue}</p>
            )}
        </div>
    );
}

// Empty form
function EmptyForm({ values, errors, onChange }: ConfigFormProps<UsePrimitiveValueConfig>) {
    const options: { value: EmptyValue; label: string; description: string }[] = [
        { value: "null", label: "Null", description: "null" },
        { value: "undefined", label: "Undefined", description: "undefined" },
        { value: "zero", label: "Zero", description: "0" },
        { value: "emptyString", label: "Empty Text", description: '""' },
    ];

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Empty Value Type
            </label>
            <div className="flex flex-col gap-2">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="emptyValue"
                            checked={values.emptyValue === option.value}
                            onChange={() => onChange({ ...values, emptyValue: option.value })}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                        <span className="text-xs text-gray-400 font-mono">({option.description})</span>
                    </label>
                ))}
            </div>
            {errors.emptyValue && (
                <p className="mt-1 text-sm text-red-500">{errors.emptyValue}</p>
            )}
        </div>
    );
}

// Validation function - only validates the active tab
export function validateUsePrimitiveValueConfig(values: UsePrimitiveValueConfig): ValidationErrors {
    const errors: ValidationErrors = {};

    switch (values.activeTab) {
        case "number":
            if (!values.numberValue.trim()) {
                errors.numberValue = "Number value is required";
            } else if (isNaN(parseFloat(values.numberValue))) {
                errors.numberValue = "Please enter a valid number";
            }
            break;

        case "text":
            if (!values.textValue) {
                errors.textValue = "Text value is required";
            }
            break;

        case "boolean":
            if (values.booleanValue === null) {
                errors.booleanValue = "Please select True or False";
            }
            break;

        case "empty":
            if (!values.emptyValue) {
                errors.emptyValue = "Please select an empty value type";
            }
            break;
    }

    return errors;
}

