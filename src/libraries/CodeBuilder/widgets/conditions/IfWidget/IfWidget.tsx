import { userInputModal } from "../../../../../components/UserInputModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { IGenericWidget } from "../../../interfaces/IGenericWidget";
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

    constructor(executor: Executor) {
        super(executor);
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
}
