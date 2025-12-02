import { nanoid } from "nanoid";
import type { IGenericWidget } from "../interfaces/IGenericWidget";

export abstract class GenericWidgetBase implements IGenericWidget {

    readonly id: string;

    constructor() {
        this.id = nanoid();
    }

    // public abstract getType(): string;
    // public abstract getToolboxItemElement(): React.ReactNode;
}
