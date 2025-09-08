import { PrimitiveVarWidgetBase } from "../../baseClasses/PrimitiveVarWidgetBase";

export class BooleanVarWidget extends PrimitiveVarWidgetBase<boolean> {

    constructor(
        name: string,
        defaultValue?: boolean
    ) {
        super(name, defaultValue || false);
    }

    set value(value: boolean) {
        if (typeof value !== "boolean") {
            console.error("The specified value is not a boolean", value);
            throw new Error("The specified value is not a boolean");
        }
        this._value = value;
    }

    get value(): boolean {
        return this._value;
    }
}
