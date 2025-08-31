import { ExecutableWidgetBase } from "../../types/ExecutableWidgetBase";
import type { BooleanVarWidget } from "../variables/BooleanVarWidget";
import type { NumberVarWidget } from "../variables/NumberVarWidget";

export class DivisionWidget extends ExecutableWidgetBase {
    protected dividend: NumberVarWidget | undefined;
    protected divisor: NumberVarWidget | undefined;
    protected truncResult: BooleanVarWidget | undefined;
    protected result: NumberVarWidget | undefined;

    setParameters(
        dividend: NumberVarWidget,
        divisor: NumberVarWidget,
        truncResult: BooleanVarWidget
    ) {
        this.dividend = dividend;
        this.divisor = divisor;
        this.truncResult = truncResult;
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

        const result = this.dividend.value / this.divisor.value;
        if (this.truncResult?.value) {
            this.result.value = Math.trunc(result);
        } else {
            this.result.value = result;
        }
        
    }
}
