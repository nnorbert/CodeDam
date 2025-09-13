import { ExecutableWidgetBase } from "../../../baseClasses/ExecutableWidgetBase";
import type { IConditionWidget } from "../../../interfaces/IConditionWidget";
import type { IExecutableWidget } from "../../../interfaces/IExecutableWidget";

export class IfWidget extends ExecutableWidgetBase implements IExecutableWidget {
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