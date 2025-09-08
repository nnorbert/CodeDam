export class PrimitiveVarWidgetBase<T = unknown> {

    protected _name: string = "";
    protected _value: T;

    constructor(
        name: string,
        defaultValue: T
    ) {
        this._name = name;
        this._value = defaultValue;
    }

    set name(name: string) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    set value(value: T) {
        this._value = value;
    }

    get value(): T {
        return this._value;
    }
}
