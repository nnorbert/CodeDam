import type { IConditionWidget } from "../../interfaces/IConditionWidget";
import type { IPrimitiveVarWidget } from "../../interfaces/IPrimitiveVarWidget";

export class EqualConditionWidget implements IConditionWidget {
    protected valueA: IPrimitiveVarWidget<unknown> | undefined;
    protected valueB: IPrimitiveVarWidget<unknown> | undefined;
    
    setParameters(
        valueA: IPrimitiveVarWidget<unknown>,
        valueB: IPrimitiveVarWidget<unknown> 
    ) {
        this.valueA = valueA;
        this.valueB = valueB;
    }

    evaluate(): boolean {
        if (!this.valueA || !this.valueB) {
            throw new Error("Equal condition widget is not configured properly");
        }

        return this.valueA.value === this.valueB.value;
    }
}