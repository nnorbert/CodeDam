import { arrayMove } from "@dnd-kit/sortable";
import { CANVAS_ID } from "../../utils/constants";
import type { IGenericWidget } from "./interfaces/IGenericWidget";
import { CreateVarWidget } from "./widgets/variables/CreateVarWidget/CreateVarWidget";

export class Executor {

    private widgets: IGenericWidget[] = [];
    private widgetMap = new Map<string, IGenericWidget>();
    private variableStack: string[] = [];

    async registerWidget(
        widgetClass: new () => IGenericWidget,
        overId: string,
        overPosition: string
    ): Promise<void> {
        const widget = new widgetClass();

        this.widgetMap.set(widget.id, widget);

        if (overId === CANVAS_ID) {
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

        // Register variable to the stack
        if (widgetClass === CreateVarWidget) {
            this.variableStack.push(widget.id);
        }

        // Initialize the widget (may show modal, etc.)
        await widget.initWidget();
    }

    reorderWidgets(activeId: string, overId: string) {
        const oldIndex = this.widgets.findIndex((w) => w.id === activeId);
        const newIndex =
            overId === CANVAS_ID
                ? this.widgets.length - 1
                : this.widgets.findIndex((w) => w.id === overId);

        if (oldIndex >= 0 && newIndex >= 0) {
            this.widgets = arrayMove(this.widgets, oldIndex, newIndex);
        }
    }

    getWidgets() {
        return [...this.widgets];
    }

    execute() {
        console.log(this.widgets);

        for (const widget of this.widgets) {
            widget.execute();
        }
    }
}