import { ExecutableWidgetBase } from "../../../baseClasses/ExecutableWidgetBase";
import type { PrimitiveVarWidgetBase } from "../../../baseClasses/PrimitiveVarWidgetBase";
import type { IExecutableWidget } from "../../../interfaces/IExecutableWidget";
import type { NumberVarWidget } from "../../variables/NumberVarWidget";

export class ReadVarWidget extends ExecutableWidgetBase implements IExecutableWidget {
    protected result: PrimitiveVarWidgetBase | undefined;

    setResult(result: NumberVarWidget) {
        this.result = result;
    }

    execute() {
        if (!this.result) {
            throw new Error("Read variable widget is not configured properly");
        }

        this.result.value = prompt(`Enter the value of ${this.result.name}`);
    }
}