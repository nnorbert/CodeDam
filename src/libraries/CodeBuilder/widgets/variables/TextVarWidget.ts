import { PrimitiveVarWidgetBase } from "../../types/PrimitiveVarWidgetBase";

export class TextVarWidget extends PrimitiveVarWidgetBase<string> {

    constructor(
        name: string,
        defaultValue?: string
    ) {
        super(name, defaultValue || '');
    }

    set value(value: string) {
        if (typeof value !== "string") {
            console.error("The specified value is not a text", value);
            throw new Error("The specified value is not a text");
        }
        this._value = value;
    }

    get value(): string {
        return this._value;
    }
}
