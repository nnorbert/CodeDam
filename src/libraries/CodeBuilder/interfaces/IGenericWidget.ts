export interface IGenericWidget {
    readonly id: string;
    render(): React.ReactNode;
    renderCode(): string;
    execute(): void;
    initWidget(): Promise<void>;
}
