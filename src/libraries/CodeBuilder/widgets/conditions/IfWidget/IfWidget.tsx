import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import { Executor } from "../../../Executor";
import IfComponent from "./component";

export class IfWidget extends GenericWidgetBase {

    public static getType(): string {
        return "if";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.CONDITIONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>If Condition</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.STATEMENT;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {
        conditionSlot: null
    };

    /** Internal executor for managing body widgets */
    public bodyExecutor: Executor;

    constructor(executor: Executor) {
        super(executor);
        // Create internal executor with canvas ID based on widget ID
        this.bodyExecutor = new Executor(`canvas-${this.id}`);
        this.bodyExecutor.setOnChange(() => {
            this.getExecutor().notifyChange();
        });
    }

    /** Returns the canvas ID for the body droppable area */
    getBodyCanvasId(): string {
        return this.bodyExecutor.getContainerId();
    }

    render(): React.ReactNode {
        return <IfComponent widget={this}></IfComponent>;
    }

    renderCode(): string {
        return `if () ...`;
    }

    execute(): void {
        // Execute
    }

    async initWidget(): Promise<void> {
        // Nothing to do
    }

    registerSlot(widget: GenericWidgetBase, slotId: string): void {
        this.slots[slotId] = widget;
    }

    unregisterSlot(slotId: string): void {
        this.slots[slotId] = null;
    }

    cleanup(): void {
        if (this.slots.conditionSlot) {
            this.executor.deleteWidget(this.slots.conditionSlot.id, true);
        }

        this.bodyExecutor.getWidgets().forEach((w) => {
            this.bodyExecutor.deleteWidget(w.id, true);
        });
    }
}
