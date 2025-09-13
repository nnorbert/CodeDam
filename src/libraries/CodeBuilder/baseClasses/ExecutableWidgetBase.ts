import type { IExecutableWidget } from "../interfaces/IExecutableWidget";
import { nanoid } from 'nanoid'

export abstract class ExecutableWidgetBase implements IExecutableWidget {
    readonly id: string;

    constructor() {
        this.id = nanoid();
    }

    abstract execute(): void;
}