import type { IConditionWidget } from "../../interfaces/IConditionWidget";

export class IfWidget {
    protected condition: IConditionWidget | undefined;

    setParameters(condition: IConditionWidget) {
        this.condition = condition;
    }

    execute() {
        if (!this.condition) {
            throw new Error("If widget is not configured properly");
        }
        
    }
}