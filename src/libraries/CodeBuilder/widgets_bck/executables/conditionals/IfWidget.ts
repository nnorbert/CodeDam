import { ExecutableWidgetBase } from "../../../baseClasses/ExecutableWidgetBase";
import { Executor } from "../../../Executor";
import type { IConditionWidget } from "../../../interfaces/IConditionWidget";
import type { IExecutableWidget } from "../../../interfaces/IExecutableWidget";

export class IfWidget extends ExecutableWidgetBase implements IExecutableWidget {
    protected condition: IConditionWidget | undefined;
    protected executorThen: Executor;

    constructor() {
        super();
        this.executorThen = new Executor();
    }

    setParameters(condition: IConditionWidget) {
        this.condition = condition;
    }

    registerThenWidget(
        widget: IExecutableWidget,
        afterId?: string
    ) {
        this.executorThen.registerWidget(widget, afterId);
    }

    execute() {
        if (!this.condition) {
            throw new Error("If widget is not configured properly");
        }
        
        if (this.condition.evaluate()) {
            this.executorThen.execute();
        }
    }
}