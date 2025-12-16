import { nanoid } from "nanoid";
import type { IGenericWidget } from "../interfaces/IGenericWidget";
import type { Executor } from "../Executor";
import type { WidgetRoleType } from "../../../utils/constants";

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

    abstract render(): React.ReactNode;
    abstract renderCode(): string;
    abstract execute(): unknown;
    abstract initWidget(): Promise<void>;
}
