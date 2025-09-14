import { ExecutableWidgetBase } from "../../../baseClasses/ExecutableWidgetBase";
import type { IExecutableWidget } from "../../../interfaces/IExecutableWidget";
import type { IPrimitiveVarWidget } from "../../../interfaces/IPrimitiveVarWidget";

export class PrintVarWidget extends ExecutableWidgetBase implements IExecutableWidget {
    protected variable: IPrimitiveVarWidget | undefined;

    setParameters(variable: IPrimitiveVarWidget) {
        this.variable = variable;
    }

    execute() {
        if (!this.variable) {
            throw new Error("Print variable widget is not configured properly");
        }

        alert(`${this.variable.name}= ${this.variable.value}`);
    }
}