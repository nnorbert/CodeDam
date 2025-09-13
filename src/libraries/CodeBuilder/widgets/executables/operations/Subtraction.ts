import { ExecutableWidgetBase } from "../../../baseClasses/ExecutableWidgetBase";
import type { IExecutableWidget } from "../../../interfaces/IExecutableWidget";
import type { NumberVarWidget } from "../../variables/NumberVarWidget";

export class SubtractionWidget extends ExecutableWidgetBase implements IExecutableWidget {
    protected nrA: NumberVarWidget | undefined;
    protected nrB: NumberVarWidget | undefined;
    protected result: NumberVarWidget | undefined;

    setParameters(nrA: NumberVarWidget, nrB: NumberVarWidget) {
        this.nrA = nrA;
        this.nrB = nrB;
    }

    setResultVar(result: NumberVarWidget) {
        this.result = result;
    }

    execute() {
        if (!this.nrA || !this.nrB || !this.result) {
            throw new Error("Subtraction widget is not configured properly");
        }

        this.result.value = this.nrA.value - this.nrB.value;
    }
}
