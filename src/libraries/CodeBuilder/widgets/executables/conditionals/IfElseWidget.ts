import { ExecutableWidgetBase } from "../../../baseClasses/ExecutableWidgetBase";
import { Executor } from "../../../Executor";
import type { IConditionWidget } from "../../../interfaces/IConditionWidget";
import type { IExecutableWidget } from "../../../interfaces/IExecutableWidget";

export class IfElseWidget extends ExecutableWidgetBase implements IExecutableWidget {
    protected condition: IConditionWidget | undefined;
    protected executorThen: Executor;
    protected executorElse: Executor;

    constructor() {
        super();
        this.executorThen = new Executor();
        this.executorElse = new Executor();
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
    
    registerElseWidget(
        widget: IExecutableWidget,
        afterId?: string
    ) {
        this.executorElse.registerWidget(widget, afterId);
    }

    execute() {
        if (!this.condition) {
            throw new Error("If-else widget is not configured properly");
        }
        
        if (this.condition.evaluate()) {
            this.executorThen.execute();
        } else {
            this.executorElse.execute();
        }
    }
}