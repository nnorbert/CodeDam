import { nanoid } from "nanoid";
import type { IGenericWidget } from "../interfaces/IGenericWidget";
import type { Executor } from "../Executor";
import type { WidgetRoleType } from "../../../utils/constants";
import type { ExecutionGenerator } from "../ExecutionTypes";

export abstract class GenericWidgetBase implements IGenericWidget {
    // Static method - called on the class itself, not instances
    static getType(): string {
        throw new Error("getType() must be implemented by subclass");
    }

    // Static method - called on the class itself, not instances
    static getCategory(): string {
        throw new Error("getCategory() must be implemented by subclass");
    }

    // Static method - called on the class itself, not instances
    static getToolboxItemElement(): React.ReactNode {
        throw new Error("getToolboxItemElement() must be implemented by subclass");
    }

    // Static method - called on the class itself, not instances
    static getRole(): WidgetRoleType {
        throw new Error("getRole() must be implemented by subclass");
    }

    // ------------------------------

    readonly executor: Executor;
    readonly id: string;

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        this.id = nanoid();
        this.executor = executor;
    }

    getExecutor(): Executor {
        if (!this.executor) {
            throw new Error("Executor not set");
        }
        return this.executor;
    }

    // Placeholder for slot registration
    registerSlot(_widget: IGenericWidget, _slotId: string): void {
        // Override in subclass with implementation if it is needed
    }

    unregisterSlot(_slotId: string): void {
        // Override in subclass with implementation if it is needed
    }

    /** Returns IDs of variables this widget references. Override in subclasses that reference variables. */
    getReferencedVariableIds(): string[] {
        return [];
    }

    /** Returns nested executors contained in this widget. Override in subclasses with nested blocks (e.g., if/else). */
    getNestedExecutors(): Executor[] {
        return [];
    }

    /**
     * Evaluate the widget and return its computed value.
     * Override in expression widgets that provide values.
     * Statement widgets can leave the default implementation.
     */
    evaluate(): unknown {
        return undefined;
    }

    abstract render(): React.ReactNode;
    abstract renderCode(): React.ReactNode | React.ReactNode[];
    /** 
     * Execute the widget. Returns an async generator that yields step points.
     * Subclasses should implement their execution logic here.
     */
    abstract execute(): ExecutionGenerator;
    abstract initWidget(): Promise<void>;
    abstract cleanup(): void;
}
