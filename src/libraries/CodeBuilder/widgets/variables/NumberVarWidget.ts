import { PrimitiveVarWidgetBase } from "../../types/PrimitiveVarWidgetBase";

export class NumberVarWidget extends PrimitiveVarWidgetBase<number> {

    constructor(
        name: string,
        defaultValue?: number
    ) {
        super(name, defaultValue || 0);
    }

    set value(value: number) {
        if (isNaN(value)) {
            console.error("The specified value is not a number", value);
            throw new Error("The specified value is not a number");
        }
        this._value = value;
    }

    get value(): number {
        return this._value;
    }
}
