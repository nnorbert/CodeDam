import { userInputModal } from "../../../../../components/UserInputModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { IGenericWidget } from "../../../interfaces/IGenericWidget";
import CreaveVarComponent from "./component";

export class CreateVarWidget extends GenericWidgetBase {

    public static getType(): string {
        return "createVar";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.VARIABLES;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Create Variable</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.STATEMENT;
    }

    // ------------------------------

    private name: string = "";
    private value: unknown | null = null;

    public slots: Record<string, GenericWidgetBase | null> = {
        valueSlot: null
    };

    constructor(executor: Executor) {
        super(executor);
    }

    getName(): string {
        return this.name;
    }

    getValue(): unknown | null {
        return this.value;
    }

    render(): React.ReactNode {
        return <CreaveVarComponent widget={this}></CreaveVarComponent>;
    }

    renderCode(): string {
        return `let ${this.name || "unnamed"}`;
    }

    execute(): void {
        this.value = this.slots.valueSlot?.execute();
    }

    async initWidget(): Promise<void> {
        const result = await userInputModal.open(
            "Enter Variable Name",
            { placeholder: "e.g. myVariable" }
        );
        
        if (result) {
            this.name = result;
        }

        // Register itself as a variable
        this.executor.registerVariable(this.id);
    }

    registerSlot(widget: GenericWidgetBase, slotId: string): void {
        this.slots[slotId] = widget;
    }

    unregisterSlot(slotId: string): void {
        this.slots[slotId] = null;
    }

    cleanup(): void {
        if (this.slots.valueSlot) {
            this.executor.deleteWidget(this.slots.valueSlot.id);
        }
    }
}
