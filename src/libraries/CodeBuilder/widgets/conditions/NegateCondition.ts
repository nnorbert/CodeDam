import type { IConditionWidget } from "../../interfaces/IConditionWidget";
import type { IPrimitiveVarWidget } from "../../interfaces/IPrimitiveVarWidget";

export class NegateConditionWidget implements IConditionWidget {
    protected value: IPrimitiveVarWidget<unknown> | undefined;
    
    setParameters(
        valueA: IPrimitiveVarWidget<unknown>
    ) {
        this.value = valueA;
    }

    evaluate(): boolean {
        if (!this.value) {
            throw new Error("Negate condition widget is not configured properly");
        }

        return !this.value.value;
    }
}