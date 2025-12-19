import { configModal } from "../../../../../components/ConfigModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import { CreateConstConfigForm, createValidator } from "./CreateConstConfigForm";
import type { IVariable } from "../../../interfaces/IVariable";
import CreaveConstComponent from "./component";

export class CreateConstWidget extends GenericWidgetBase implements IVariable {

    public static getType(): string {
        return "createConst";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.VARIABLES;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Create Constant</div>;
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

    public isConstant: boolean = true;
    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    getName(): string {
        return this.name;
    }

    getValue(): unknown | null {
        return this.value;
    }

    setValue(_value: unknown): void {
        throw new Error("Cannot set value of a constant");
    }

    render(): React.ReactNode {
        return <CreaveConstComponent widget={this}></CreaveConstComponent>;
    }

    renderCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)", display: "block" }
            : { display: "block" };

        return (
            <div style={highlightStyle}>
                <span style={{ color: "#569CD6", fontStyle: "normal" }}>const</span>
                <span style={{ color: "#D4D4D4" }}> </span>
                <span style={{ color: "#9CDCFE", fontStyle: "normal" }}>{this.name || "unnamed"}</span>
                <span style={{ color: "#D4D4D4" }}> = </span>
                {this.slots.valueSlot?.renderCode() ?? <span style={{ color: "#569CD6", fontStyle: "normal" }}>undefined</span>}
                <span style={{ color: "#D4D4D4" }}>;</span>
            </div>
        );
    }

    async *execute(): ExecutionGenerator {
        yield { type: 'step', widget: this };
        // Evaluate the value from the slot
        this.value = this.slots.valueSlot?.evaluate();
        
        // Update the execution stack with this variable's name and value
        if (this.name) {
            this.executor.setExecutionVariable(this.name, this.value);
        }
    }

    async openConfig(): Promise<boolean> {
        // Get existing variable names, excluding this widget's current name (for editing)
        const existingNames = this.executor.getVariableNames(this.id);

        const result = await configModal.open({
            title: "Configure Constant",
            initialValues: { name: this.name },
            validate: createValidator(existingNames),
            renderContent: (props) => <CreateConstConfigForm {...props} />,
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
        this.executor.registerVariable(this);
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
