import type { Executor } from "../Executor";
import type { ExecutionGenerator } from "../ExecutionTypes";

export interface IGenericWidget {
    readonly id: string;
    readonly executor: Executor;
    /** Whether this widget is currently being executed */
    inExecution: boolean;
    getExecutor(): Executor;
    render(): React.ReactNode;
    renderCode(): React.ReactNode | React.ReactNode[];
    /** 
     * Execute the widget. Returns an async generator that yields step points.
     * Each 'step' yield pauses execution until the next step event.
     * Each 'await' yield waits for an async operation without counting as a step.
     */
    execute(): ExecutionGenerator;
    /**
     * Evaluate the widget and return its computed value.
     * Used by expression widgets (e.g., UseVarWidget, UsePrimitiveValueWidget).
     * Statement widgets can return undefined.
     */
    evaluate(): unknown;
    initWidget(): Promise<void>;
    registerSlot(widget: IGenericWidget, slotId: string): void;
    unregisterSlot(slotId: string): void;
    cleanup(): void;
    /** Returns IDs of variables this widget references. Used for dependency tracking. */
    getReferencedVariableIds(): string[];
    /** Returns nested executors contained in this widget (e.g., if/else branches). */
    getNestedExecutors(): Executor[];
}
