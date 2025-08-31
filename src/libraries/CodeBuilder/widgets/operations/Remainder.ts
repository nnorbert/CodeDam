import { ExecutableWidgetBase } from "../../types/ExecutableWidgetBase";
import type { NumberVarWidget } from "../variables/NumberVarWidget";

export class RemainderWidget extends ExecutableWidgetBase {
    protected dividend: NumberVarWidget | undefined;
    protected divisor: NumberVarWidget | undefined;
    protected result: NumberVarWidget | undefined;

    setParameters(dividend: NumberVarWidget, divisor: NumberVarWidget) {
        this.dividend = dividend;
        this.divisor = divisor;
    }

    setResultVar(result: NumberVarWidget) {
        this.result = result;
    }

    execute() {
        if (!this.dividend || !this.divisor || !this.result) {
            throw new Error("Division widget is not configured properly");
        }

        if (this.divisor.value === 0) {
            throw new Error("Division error: divisor cannot be 0!");
        }

        this.result.value = this.dividend.value % this.divisor.value;
    }
}
