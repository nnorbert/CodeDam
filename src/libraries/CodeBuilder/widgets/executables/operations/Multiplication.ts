import { ExecutableWidgetBase } from "../../../baseClasses/ExecutableWidgetBase";
import type { IExecutableWidget } from "../../../interfaces/IExecutableWidget";
import type { NumberVarWidget } from "../../variables/NumberVarWidget";

export class MultiplicationWidget extends ExecutableWidgetBase implements IExecutableWidget {
    protected multiplicand: NumberVarWidget | undefined;
    protected multiplier: NumberVarWidget | undefined;
    protected result: NumberVarWidget | undefined;

    setParameters(multiplicand: NumberVarWidget, multiplier: NumberVarWidget) {
        this.multiplicand = multiplicand;
        this.multiplier = multiplier;
    }

    setResultVar(result: NumberVarWidget) {
        this.result = result;
    }

    execute() {
        if (!this.multiplicand || !this.multiplier || !this.result) {
            throw new Error("Multiplication widget is not configured properly");
        }

        this.result.value = this.multiplicand.value * this.multiplier.value;
    }
}
