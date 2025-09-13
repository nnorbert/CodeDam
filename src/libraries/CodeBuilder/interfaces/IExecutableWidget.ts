export interface IExecutableWidget {
    readonly id: string;
    execute(): void;
}
