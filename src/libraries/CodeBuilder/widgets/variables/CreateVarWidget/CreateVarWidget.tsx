import { configModal } from "../../../../../components/ConfigModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import CreaveVarComponent from "./component";
import { CreateVarConfigForm, createValidator } from "./CreateVarConfigForm";

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

    async openConfig(): Promise<boolean> {
        // Get existing variable names, excluding this widget's current name (for editing)
        const existingNames = this.executor.getVariableNames(this.id);

        const result = await configModal.open({
            title: "Configure Variable",
            initialValues: { name: this.name },
            validate: createValidator(existingNames),
            renderContent: (props) => <CreateVarConfigForm {...props} />,
        });

        if (result) {
            this.name = result.name.trim();
            return true;
        }
        return false;
    }

    async initWidget(): Promise<void> {
        await this.openConfig();

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
