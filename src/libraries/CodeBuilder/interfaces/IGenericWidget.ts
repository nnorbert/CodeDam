import type { Executor } from "../Executor";

export interface IGenericWidget {
    readonly id: string;
    readonly executor: Executor;
    getExecutor(): Executor;
    render(): React.ReactNode;
    renderCode(): string;
    execute(): void;
    initWidget(): Promise<void>;
}
