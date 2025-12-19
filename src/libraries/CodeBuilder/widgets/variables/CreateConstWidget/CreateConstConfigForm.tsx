import type { ConfigFormProps, ValidationErrors } from "../../../../../components/ConfigModal";

// Configuration form values type
export interface CreateConstConfig extends Record<string, unknown> {
    name: string;
}

// Configuration form component
export function CreateConstConfigForm({ values, errors, onChange }: ConfigFormProps<CreateConstConfig>) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Constant Name
            </label>
            <input
                type="text"
                value={values.name}
                onChange={(e) => onChange({ ...values, name: e.target.value })}
                placeholder="e.g. myConstant"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                autoFocus
            />
            {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
        </div>
    );
}

// JavaScript reserved keywords
const RESERVED_KEYWORDS = new Set([
    "break", "case", "catch", "continue", "debugger", "default", "delete",
    "do", "else", "finally", "for", "function", "if", "in", "instanceof",
    "new", "return", "switch", "this", "throw", "try", "typeof", "var",
    "void", "while", "with", "class", "const", "enum", "export", "extends",
    "import", "super", "implements", "interface", "let", "package", "private",
    "protected", "public", "static", "yield", "await", "null", "true", "false"
]);

// Valid JavaScript identifier pattern:
// - Must start with letter, underscore, or dollar sign
// - Can contain letters, digits, underscores, or dollar signs
const VALID_IDENTIFIER_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

// Factory function that creates a validator with existing variable names
export function createValidator(existingNames: string[]) {
    return function validateCreateConstConfig(values: CreateConstConfig): ValidationErrors {
        const errors: ValidationErrors = {};
        const name = values.name.trim();

        if (!name) {
            errors.name = "Constant name is required";
        } else if (!VALID_IDENTIFIER_REGEX.test(name)) {
            if (/^\d/.test(name)) {
                errors.name = "Constant name cannot start with a number";
            } else if (/\s/.test(name)) {
                errors.name = "Constant name cannot contain spaces";
            } else {
                errors.name = "Constant name can only contain letters, numbers, underscores, and dollar signs";
            }
        } else if (RESERVED_KEYWORDS.has(name)) {
            errors.name = `"${name}" is a reserved keyword`;
        } else if (existingNames.includes(name)) {
            errors.name = `A constant named "${name}" already exists`;
        }

        return errors;
    };
}

