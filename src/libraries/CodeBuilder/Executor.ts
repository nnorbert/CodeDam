import { arrayMove } from "@dnd-kit/sortable";
import type { IGenericWidget } from "./interfaces/IGenericWidget";
import type { IVariable } from "./interfaces/IVariable";

export class Executor {

    private readonly containerId: string;
    private widgets: IGenericWidget[] = [];
    private widgetMap = new Map<string, IGenericWidget>();
    private variableStack: Record<string, IGenericWidget & IVariable> = {};
    private slotMap = new Map<string, {
        widgetId: string;
        slotId: string;
    }>();
    private onChange: (() => void) | null = null;
    private parentExecutor: Executor | undefined;

    constructor(containerId: string, parentExecutor?: Executor) {
        this.parentExecutor = parentExecutor;
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
        delete this.variableStack[widgetId];

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

    registerVariable(variable: IGenericWidget & IVariable) {
        this.variableStack[variable.id] = variable;
    }

    getVariableNames(excludeWidgetId?: string): string[] {
        const names: string[] = [];
        for (const [widgetId, variable] of Object.entries(this.variableStack)) {
            if (excludeWidgetId && widgetId === excludeWidgetId) continue;
            const name = variable.getName();
            if (name) names.push(name);
        }
        return names;
    }

    isVariableNameTaken(name: string, excludeWidgetId?: string): boolean {
        return this.getVariableNames(excludeWidgetId).includes(name);
    }


    getVariableStack(): Record<string, IGenericWidget & IVariable> {
        const parentStack = this.parentExecutor?.getVariableStack() ?? {};

        // Get local variable names to shadow parent variables with the same name
        const localNames = new Set(
            Object.values(this.variableStack).map((v) => v.getName())
        );

        // Filter out parent variables that are shadowed by local ones
        const filteredParentStack = Object.fromEntries(
            Object.entries(parentStack).filter(
                ([, variable]) => !localNames.has(variable.getName())
            )
        );

        return { ...filteredParentStack, ...this.variableStack };
    }

    /**
     * Find all usages of a variable in this executor and nested executors.
     * Returns an array of widget IDs that reference the variable.
     */
    findVariableUsages(variableId: string): string[] {
        const usages: string[] = [];
        this.findVariableUsagesRecursive(variableId, usages);
        return usages;
    }

    private findVariableUsagesRecursive(variableId: string, usages: string[]): void {
        // Check all widgets in this executor (widgetMap contains both root widgets and slot widgets)
        for (const widget of this.widgetMap.values()) {
            // Check if this widget references the variable
            if (widget.getReferencedVariableIds().includes(variableId)) {
                usages.push(widget.id);
            }

            // Check nested executors (e.g., if/else branches)
            for (const nestedExecutor of widget.getNestedExecutors()) {
                nestedExecutor.findVariableUsagesRecursive(variableId, usages);
            }
        }
    }

    /**
     * Check if a variable is in use by any widget.
     * Returns info about usage if found.
     */
    isVariableInUse(variableId: string): { inUse: boolean; usageCount: number } {
        const usages = this.findVariableUsages(variableId);
        return {
            inUse: usages.length > 0,
            usageCount: usages.length
        };
    }

    getCodePreview(): React.ReactNode[] {
        return this.widgets.flatMap((w) => w.renderCode());
    }

    execute() {
        console.log(this.widgets);

        for (const widget of this.widgets) {
            widget.execute();
        }
    }
}