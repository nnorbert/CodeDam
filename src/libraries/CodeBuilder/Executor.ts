import { arrayMove } from "@dnd-kit/sortable";
import type { IGenericWidget } from "./interfaces/IGenericWidget";

export class Executor {

    private readonly containerId: string;
    private widgets: IGenericWidget[] = [];
    private widgetMap = new Map<string, IGenericWidget>();
    private variableStack: string[] = [];
    private slotMap = new Map<string, {
        widgetId: string;
        slotId: string;
    }>();
    private onChange: (() => void) | null = null;

    constructor(containerId: string) {
        this.containerId = containerId;
    }

    setOnChange(callback: (() => void) | null) {
        this.onChange = callback;
    }

    notifyChange() {
        this.onChange?.();
    }

    getContainerId(): string {
        return this.containerId;
    }

    createWidget(widgetClass: new (executor: Executor) => IGenericWidget): IGenericWidget {
        const widget = new widgetClass(this);
        this.widgetMap.set(widget.id, widget);
        return widget;
    }

    deleteWidget(widgetId: string, silent: boolean = false) {
        const widget = this.widgetMap.get(widgetId);
        if (!widget) return; // Early exit if widget doesn't exist

        try {
            widget.cleanup();
        } catch (e) {
            console.error(`Error cleaning up widget ${widgetId}:`, e);
            // Continue with deletion even if cleanup fails
        }

        const slotInfo = this.slotMap.get(widgetId);
        if (slotInfo) {
            this.widgetMap.get(slotInfo.widgetId)?.unregisterSlot(slotInfo.slotId);
            this.slotMap.delete(widgetId);
        }

        this.widgetMap.delete(widgetId);
        this.widgets = this.widgets.filter((w) => w.id !== widgetId);
        this.variableStack = this.variableStack.filter((v) => v !== widgetId);

        if (!silent) {
            this.notifyChange();
        }
    }

    async registerWidget(
        widgetClass: new (executor: Executor) => IGenericWidget,
        overId: string,
        overPosition: string
    ): Promise<void> {
        const widget = this.createWidget(widgetClass);

        if (overId === this.containerId) {
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

        // Initialize the widget
        await widget.initWidget();
    }

    reorderWidgets(activeId: string, overId: string) {
        const oldIndex = this.widgets.findIndex((w) => w.id === activeId);
        const newIndex =
            overId === this.containerId
                ? this.widgets.length - 1
                : this.widgets.findIndex((w) => w.id === overId);

        if (oldIndex >= 0 && newIndex >= 0) {
            this.widgets = arrayMove(this.widgets, oldIndex, newIndex);
        }
    }

    getWidgets() {
        return [...this.widgets];
    }

    async registerSlot(
        widgetClass: new (executor: Executor) => IGenericWidget,
        widgetId: string,
        slotId: string
    ): Promise<void> {
        if (!this.widgetMap.has(widgetId)) {
            return;
        }

        const widget = this.createWidget(widgetClass);

        this.widgetMap.get(widgetId)?.registerSlot(widget, slotId);
        this.slotMap.set(widget.id, { widgetId, slotId });

        // Initialize the widget
        await widget.initWidget();

        this.notifyChange();
    }

    registerVariable(id: string) {
        this.variableStack.push(id);
    }

    execute() {
        console.log(this.widgets);

        for (const widget of this.widgets) {
            widget.execute();
        }
    }
}