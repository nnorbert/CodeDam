export interface IVariable {
    readonly isConstant: boolean;
    getName(): string;
    getValue(): unknown;
    setValue(value: unknown): void;
}
