export interface IPrimitiveVarWidget<T = unknown> {
    set name(name: string);
    get name(): T;
    set value(value: T);
    get value(): T;
}