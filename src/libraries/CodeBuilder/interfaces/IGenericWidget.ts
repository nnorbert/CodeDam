import type { Executor } from "../Executor";

export interface IGenericWidget {
    readonly id: string;
    readonly executor: Executor;
    getExecutor(): Executor;
    render(): React.ReactNode;
    renderCode(): string;
    execute(): unknown;
    initWidget(): Promise<void>;
    registerSlot(widget: IGenericWidget, slotId: string): void;
}
