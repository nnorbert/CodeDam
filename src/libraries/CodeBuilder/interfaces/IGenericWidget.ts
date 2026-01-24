import type { Executor } from "../Executor";
import type { ExecutionGenerator } from "../ExecutionTypes";
import type { CodeLanguageType } from "../../../utils/constants";

export interface IGenericWidget {
    readonly id: string;
    readonly executor: Executor;
    /** Whether this widget is currently being executed */
    inExecution: boolean;
    /** 
     * Array of line keys that should be highlighted during execution.
     * Keys correspond to the keys used in renderCode().
     * Empty array means no specific lines highlighted (backward compatible).
     */
    activeLineKeys: string[];
    getExecutor(): Executor;
    render(): React.ReactNode;
    /**
     * Render the code representation of this widget.
     * @param language - The target language (JavaScript/Python)
     * @param indent - Base indentation string from parent (e.g., "    " for 4 spaces)
     * @returns React node(s) representing the code. Statement widgets should return
     *          span-based content; the caller handles line wrapping.
     */
    renderCode(language: CodeLanguageType, indent?: string): React.ReactNode | React.ReactNode[];
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
     * Async to support widgets that need user interaction (e.g., UserInputWidget).
     */
    evaluate(): Promise<unknown>;
    initWidget(): Promise<void>;
    registerSlot(widget: IGenericWidget, slotId: string): void;
    unregisterSlot(slotId: string): void;
    cleanup(): void;
    /** Returns IDs of variables this widget references. Used for dependency tracking. */
    getReferencedVariableIds(): string[];
    /** Returns nested executors contained in this widget (e.g., if/else branches). */
    getNestedExecutors(): Executor[];
}
