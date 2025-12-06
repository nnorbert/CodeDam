import type { IGenericWidget } from "./interfaces/IGenericWidget";

export class Executor {

    widgets: IGenericWidget[] = [];
    widgetMap = new Map<string, IGenericWidget>();

    registerWidget(
        widget: IGenericWidget,
        overId: string,
        overPosition: string
    ) {
        this.widgetMap.set(widget.id, widget);
        if (overId === "canvas") {
            this.widgets.push(widget);
          } else {
            const overIndex = this.widgets.findIndex((w) => w.id === overId);
            if (overIndex < 0) return;
    
            if (overPosition === "top") {
                this.widgets.splice(overIndex, 0, widget);
            } else {
                this.widgets.splice(overIndex + 1, 0, widget);
            }
          }
    }

    execute() {
        console.log(this.widgets);
        
        for (const widget of this.widgets) {
            widget.execute();
        }
    }
}