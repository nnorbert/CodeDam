import { ExecutableWidgetBase } from "../../../baseClasses/ExecutableWidgetBase";
import type { PrimitiveVarWidgetBase } from "../../../baseClasses/PrimitiveVarWidgetBase";
import type { IExecutableWidget } from "../../../interfaces/IExecutableWidget";
import type { NumberVarWidget } from "../../variables/NumberVarWidget";

export class PrintVarWidget extends ExecutableWidgetBase implements IExecutableWidget {
    protected variable: PrimitiveVarWidgetBase | undefined;

    setParameters(variable: NumberVarWidget) {
        this.variable = variable;
    }

    execute() {
        if (!this.variable) {
            throw new Error("Print variable widget is not configured properly");
        }

        alert(`${this.variable.name}= ${this.variable.value}`);
    }
}