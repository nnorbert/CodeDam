import { arrayMove } from "@dnd-kit/sortable";
import type { IGenericWidget } from "./interfaces/IGenericWidget";
import type { IVariable } from "./interfaces/IVariable";
import type { ExecutionGenerator, ExecutionVariable, ExecutionScope, ExecutionStackSnapshot } from "./ExecutionTypes";
import { CodeLanguages, type CodeLanguageType } from "../../utils/constants";
import type { GenericWidgetBase } from "./baseClasses/GenericWidgetBase";
import { applyWidgetConfig } from "./persistence/widgetConfig";

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
    private onExecutionStackChange: (() => void) | null = null;
    private parentExecutor: Executor | undefined;
    private pendingWidgetId: string | undefined;

    // Execution stack for runtime variable tracking
    private executionVariables: Map<string, ExecutionVariable> = new Map();
    private scopeId: string;
    private scopeName: string;
    private isScopeActive: boolean = false;

    constructor(containerId: string, parentExecutor?: Executor, scopeName?: string) {
        this.parentExecutor = parentExecutor;
        this.containerId = containerId;
        this.scopeId = containerId;
        this.scopeName = scopeName ?? (parentExecutor ? "Block" : "Global");
    }

    setOnChange(callback: (() => void) | null) {
        this.onChange = callback;
    }

    notifyChange() {
        this.onChange?.();
    }

    setOnExecutionStackChange(callback: (() => void) | null) {
        this.onExecutionStackChange = callback;
        // Propagate to nested executors
        for (const widget of this.widgetMap.values()) {
            for (const nestedExecutor of widget.getNestedExecutors()) {
                nestedExecutor.setOnExecutionStackChange(callback);
            }
        }
    }

    private notifyExecutionStackChange() {
        // Always notify through the root executor's callback
        if (this.parentExecutor) {
            this.parentExecutor.notifyExecutionStackChange();
        } else {
            this.onExecutionStackChange?.();
        }
    }

    // ========== Execution Stack Methods ==========

    /**
     * Set or update a variable's value in the execution stack.
     */
    setExecutionVariable(name: string, value: unknown): void {
        this.executionVariables.set(name, { name, value });
        this.notifyExecutionStackChange();
    }

    /**
     * Get a variable's value from the execution stack.
     * Searches current scope first, then parent scopes.
     */
    getExecutionVariable(name: string): ExecutionVariable | undefined {
        const local = this.executionVariables.get(name);
        if (local) return local;
        return this.parentExecutor?.getExecutionVariable(name);
    }

    /**
     * Enter this scope - marks it as active for display purposes.
     */
    enterScope(): void {
        this.isScopeActive = true;
        this.notifyExecutionStackChange();
    }

    /**
     * Exit this scope - clears all execution variables and marks inactive.
     */
    exitScope(): void {
        this.executionVariables.clear();
        this.isScopeActive = false;
        this.notifyExecutionStackChange();
    }

    /**
     * Clear all execution variables in this scope (and optionally nested scopes).
     * Called when execution stops or resets.
     */
    clearExecutionStack(): void {
        this.executionVariables.clear();
        this.isScopeActive = false;
        
        // Clear nested executors too
        for (const widget of this.widgetMap.values()) {
            for (const nestedExecutor of widget.getNestedExecutors()) {
                nestedExecutor.clearExecutionStack();
            }
        }
        
        this.notifyExecutionStackChange();
    }

    /**
     * Get the current scope as an ExecutionScope object.
     */
    private getCurrentScope(): ExecutionScope {
        return {
            scopeId: this.scopeId,
            scopeName: this.scopeName,
            variables: Array.from(this.executionVariables.values()),
            isActive: this.isScopeActive
        };
    }

    /**
     * Collect the full execution stack snapshot from root to this executor.
     * Only includes active scopes with variables or that are currently active.
     */
    getExecutionStackSnapshot(): ExecutionStackSnapshot {
        const stack: ExecutionStackSnapshot = [];
        
        // Start from root and build down to current scope
        this.collectStackFromRoot(stack);
        
        return stack;
    }

    private collectStackFromRoot(stack: ExecutionStackSnapshot): void {
        // First, collect parent's stack
        if (this.parentExecutor) {
            this.parentExecutor.collectStackFromRoot(stack);
        }
        
        // Add current scope if it's active or has variables
        const currentScope = this.getCurrentScope();
        if (currentScope.isActive || currentScope.variables.length > 0) {
            stack.push(currentScope);
        }
        
        // Collect from nested executors that are active
        for (const widget of this.widgetMap.values()) {
            for (const nestedExecutor of widget.getNestedExecutors()) {
                if (nestedExecutor.isScopeActive) {
                    nestedExecutor.collectNestedScopes(stack);
                }
            }
        }
    }

    private collectNestedScopes(stack: ExecutionStackSnapshot): void {
        const currentScope = this.getCurrentScope();
        if (currentScope.isActive || currentScope.variables.length > 0) {
            stack.push(currentScope);
        }
        
        // Continue collecting from nested active scopes
        for (const widget of this.widgetMap.values()) {
            for (const nestedExecutor of widget.getNestedExecutors()) {
                if (nestedExecutor.isScopeActive) {
                    nestedExecutor.collectNestedScopes(stack);
                }
            }
        }
    }

    getContainerId(): string {
        return this.containerId;
    }

    /**
     * Consumes a pending widget ID set by createWidgetWithId.
     * Called from GenericWidgetBase during construction.
     */
    consumePendingWidgetId(): string | undefined {
        const id = this.pendingWidgetId;
        this.pendingWidgetId = undefined;
        return id;
    }

    createWidget(widgetClass: new (executor: Executor, options?: { id?: string }) => IGenericWidget): IGenericWidget {
        const widget = new widgetClass(this);
        this.widgetMap.set(widget.id, widget);
        return widget;
    }

    createWidgetWithId(
        widgetClass: new (executor: Executor, options?: { id?: string }) => IGenericWidget,
        id: string
    ): IGenericWidget {
        this.pendingWidgetId = id;
        return this.createWidget(widgetClass);
    }

    /**
     * Create a widget with a preserved ID and apply config without opening modals.
     * Registers createVar/createConst widgets in the variable stack.
     */
    loadWidgetSilent(
        widgetClass: new (executor: Executor, options?: { id?: string }) => IGenericWidget,
        id: string,
        config?: Record<string, unknown>
    ): IGenericWidget {
        const widget = this.createWidgetWithId(widgetClass, id);

        if (config) {
            const applied = applyWidgetConfig(widget, config);
            if (!applied) {
                const type = (widgetClass as unknown as typeof GenericWidgetBase).getType();
                console.warn(`Failed to apply config for widget ${id} (${type})`);
            }
        }

        const type = (widgetClass as unknown as typeof GenericWidgetBase).getType();
        if (type === "createVar" || type === "createConst") {
            this.registerVariable(widget as IGenericWidget & IVariable);
        }

        return widget;
    }

    /** Add a top-level statement widget to this executor's canvas. */
    appendStatementWidget(widget: IGenericWidget): void {
        this.widgets.push(widget);
    }

    /** Record slot ownership for a widget placed in a parent's slot. */
    linkSlotWidget(slotWidgetId: string, parentWidgetId: string, slotId: string): void {
        this.slotMap.set(slotWidgetId, { widgetId: parentWidgetId, slotId });
    }

    clear(): void {
        const topLevelWidgets = [...this.widgets];
        for (const widget of topLevelWidgets) {
            try {
                widget.cleanup();
            } catch (e) {
                console.error(`Error cleaning up widget ${widget.id} during clear:`, e);
            }
        }

        this.widgets = [];
        this.widgetMap.clear();
        this.variableStack = {};
        this.slotMap.clear();
        this.clearExecutionStack();
        this.notifyChange();
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
        widgetClass: new (executor: Executor, options?: { id?: string }) => IGenericWidget,
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

    getWidget(widgetId: string): IGenericWidget | undefined {
        return this.widgetMap.get(widgetId);
    }

    async registerSlot(
        widgetClass: new (executor: Executor, options?: { id?: string }) => IGenericWidget,
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

    unregisterVariable(widgetId: string): void {
        delete this.variableStack[widgetId];
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

    getCodePreview(language: CodeLanguageType = CodeLanguages.JAVASCRIPT): React.ReactNode[] {
        return this.widgets.flatMap((w) => w.renderCode(language, ""));
    }

    /**
     * Execute all widgets in this executor.
     * Yields step points from each widget's execute() method.
     * Uses yield* to delegate to child widgets, keeping the generator chain intact.
     */
    async *execute(): ExecutionGenerator {
        this.enterScope();
        try {
            for (const widget of this.widgets) {
                yield* widget.execute();
            }

            if (!this.parentExecutor) {
                yield { type: 'step', widget: this.widgets[this.widgets.length - 1] };
            }
        } finally {
            this.exitScope();
        }
    }
}