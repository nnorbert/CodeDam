import type { IExecutableWidget } from "./interfaces/IExecutableWidget";

export class Executor {

    private widgets: IExecutableWidget[] = [];
    private widgetMap = new Map<string, IExecutableWidget>();
    private executionPionter: number = 0;

    registerWidget(
        widget: IExecutableWidget,
        afterId?: string
    ) {
        if (!afterId) {
            this.widgets.unshift(widget);
        } else {
            const position = 1 + this.widgets.findIndex((widget) => {
                return widget.id === afterId;
            });
            this.widgets.splice(position, 0, widget);
        }
        
        this.widgetMap.set(widget.id, widget);
    }

    execute() {
        console.log(this.widgets);
        
        for (const widget of this.widgets) {
            widget.execute();
        }
    }
}