import { configModal } from "../../../../../components/ConfigModal";
import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import CreaveVarComponent from "./component";
import { CreateVarConfigForm, createValidator } from "./CreateVarConfigForm";
import type { IVariable } from "../../../interfaces/IVariable";

export class CreateVarWidget extends GenericWidgetBase implements IVariable {

    public static getType(): string {
        return "createVar";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.VARIABLES;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div title="Create Variable">Create Variable</div>;
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

    public isConstant: boolean = false;
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

    setValue(value: unknown): void {
        this.value = value;
        this.executor.setExecutionVariable(this.name, value);
    }

    render(): React.ReactNode {
        return <CreaveVarComponent widget={this}></CreaveVarComponent>;
    }

    renderCode(language: CodeLanguageType, indent: string = ""): React.ReactNode {
        return language === CodeLanguages.PYTHON 
            ? this.renderPythonCode(indent) 
            : this.renderJavaScriptCode(indent);
    }

    private renderJavaScriptCode(indent: string): React.ReactNode {
        return (
            <span key={`${this.id}-line`}>
                {indent}<span style={{ color: "#569CD6", fontStyle: "normal" }}>let</span>
                <span style={{ color: "#D4D4D4" }}> </span>
                <span style={{ color: "#9CDCFE", fontStyle: "normal" }}>{this.name || "unnamed"}</span>
                <span style={{ color: "#D4D4D4" }}> = </span>
                {this.slots.valueSlot?.renderCode(CodeLanguages.JAVASCRIPT, "") ?? <span style={{ color: "#569CD6", fontStyle: "normal" }}>undefined</span>}
                <span style={{ color: "#D4D4D4" }}>;</span>
            </span>
        );
    }

    private renderPythonCode(indent: string): React.ReactNode {
        return (
            <span key={`${this.id}-line`}>
                {indent}<span style={{ color: "#9CDCFE", fontStyle: "normal" }}>{this.name || "unnamed"}</span>
                <span style={{ color: "#D4D4D4" }}> = </span>
                {this.slots.valueSlot?.renderCode(CodeLanguages.PYTHON, "") ?? <span style={{ color: "#569CD6", fontStyle: "normal" }}>None</span>}
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        this.activeLineKeys = [`${this.id}-line`];
        yield { type: 'step', widget: this };
        
        // Evaluate the value from the slot (async to support user input)
        this.value = await this.slots.valueSlot?.evaluate();
        
        // Update the execution stack with this variable's name and value
        if (this.name) {
            this.executor.setExecutionVariable(this.name, this.value);
        }
        
        this.activeLineKeys = [];
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
