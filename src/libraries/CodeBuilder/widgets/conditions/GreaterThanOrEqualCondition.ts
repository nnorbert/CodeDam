import type { NumberVarWidget } from "../variables/NumberVarWidget";

export class GreaterThanOrEqualConditionWidget {
    protected valueA: NumberVarWidget | undefined;
    protected valueB: NumberVarWidget | undefined;

    setParameters(
        valueA: NumberVarWidget,
        valueB: NumberVarWidget 
    ) {
        this.valueA = valueA;
        this.valueB = valueB;
    }

    evaluate(): boolean {
        if (!this.valueA || !this.valueB) {
            throw new Error("Greater than or equal condition widget is not configured properly");
        }

        return this.valueA.value >= this.valueB.value;
    }
}