import type { IGenericWidget } from "./interfaces/IGenericWidget";

/**
 * Represents a yield point during widget execution.
 * 
 * - 'step': A normal execution step - controller waits for step event before continuing
 * - 'await': An async operation - controller waits for promise, doesn't count as a step
 */
export type StepYield =
    | { type: 'step'; widget: IGenericWidget }
    | { type: 'await'; promise: Promise<unknown> };

/**
 * The async generator type that widgets and executors use for execution.
 */
export type ExecutionGenerator = AsyncGenerator<StepYield, void, void>;

/**
 * Represents a variable's runtime state during execution.
 */
export interface ExecutionVariable {
    name: string;
    value: unknown;
}

/**
 * Represents a scope level with its variables.
 * Each scope contains the variables declared within it.
 */
export interface ExecutionScope {
    scopeId: string;      // Unique identifier (e.g., "main" or "if-{widgetId}")
    scopeName: string;    // Human-readable name (e.g., "Global" or "If Block")
    variables: ExecutionVariable[];
    isActive: boolean;    // Whether this scope is currently being executed
}

/**
 * A snapshot of the entire execution stack, from outermost to innermost scope.
 */
export type ExecutionStackSnapshot = ExecutionScope[];

