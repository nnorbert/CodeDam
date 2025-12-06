import { nanoid } from "nanoid";
import type { IGenericWidget } from "../interfaces/IGenericWidget";

export abstract class GenericWidgetBase implements IGenericWidget {
    // Static method - called on the class itself, not instances
    static getType(): string {
        throw new Error("getType() must be implemented by subclass");
    }

    // Static method - called on the class itself, not instances
    static getToolboxItemElement(): React.ReactNode {
        throw new Error("getToolboxItemElement() must be implemented by subclass");
    }

    // ------------------------------

    readonly id: string;

    constructor() {
        this.id = nanoid();
    }

    abstract render(): React.ReactNode;
    abstract renderCode(): string;
    abstract execute(): void;
}
