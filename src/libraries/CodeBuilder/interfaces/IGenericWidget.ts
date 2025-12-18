import type { Executor } from "../Executor";

export interface IGenericWidget {
    readonly id: string;
    readonly executor: Executor;
    getExecutor(): Executor;
    render(): React.ReactNode;
    renderCode(): React.ReactNode | React.ReactNode[];
    execute(): unknown;
    initWidget(): Promise<void>;
    registerSlot(widget: IGenericWidget, slotId: string): void;
    unregisterSlot(slotId: string): void;
    cleanup(): void;
    /** Returns IDs of variables this widget references. Used for dependency tracking. */
    getReferencedVariableIds(): string[];
    /** Returns nested executors contained in this widget (e.g., if/else branches). */
    getNestedExecutors(): Executor[];
}
