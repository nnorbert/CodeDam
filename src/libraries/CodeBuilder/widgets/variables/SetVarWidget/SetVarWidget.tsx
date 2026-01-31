import { configModal } from "../../../../../components/ConfigModal";
import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import type { IGenericWidget } from "../../../interfaces/IGenericWidget";
import type { IVariable } from "../../../interfaces/IVariable";
import SetVarComponent from "./component";
import { SetVarConfigForm, validateSetVarConfig, type SetVarConfig, type VariableOption } from "./SetVarConfigForm";

export class SetVarWidget extends GenericWidgetBase {

    public static getType(): string {
        return "setVar";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.VARIABLES;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div title="Set Variable">Set Variable</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.STATEMENT;
    }

    private targetVariable: (IGenericWidget & IVariable) | null = null;

    public slots: Record<string, GenericWidgetBase | null> = {
        valueSlot: null
    };

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    getReferencedVariableIds(): string[] {
        return this.targetVariable ? [this.targetVariable.id] : [];
    }

    getTargetVariableName(): string | null {
        return this.targetVariable?.getName() ?? null;
    }

    render(): React.ReactNode {
        return <SetVarComponent widget={this}></SetVarComponent>;
    }

    renderCode(language: CodeLanguageType, indent: string = ""): React.ReactNode {
        return language === CodeLanguages.PYTHON 
            ? this.renderPythonCode(indent) 
            : this.renderJavaScriptCode(indent);
    }

    private renderJavaScriptCode(indent: string): React.ReactNode {
        return (
            <span key={`${this.id}-line`}>
                {indent}<span style={{ color: "#9CDCFE", fontStyle: "normal" }}>{this.getTargetVariableName() || "not set"}</span>
                <span style={{ color: "#D4D4D4" }}> = </span>
                {this.slots.valueSlot?.renderCode(CodeLanguages.JAVASCRIPT, "") ?? <span style={{ color: "#569CD6", fontStyle: "normal" }}>undefined</span>}
                <span style={{ color: "#D4D4D4" }}>;</span>
            </span>
        );
    }

    private renderPythonCode(indent: string): React.ReactNode {
        return (
            <span key={`${this.id}-line`}>
                {indent}<span style={{ color: "#9CDCFE", fontStyle: "normal" }}>{this.getTargetVariableName() || "not_set"}</span>
                <span style={{ color: "#D4D4D4" }}> = </span>
                {this.slots.valueSlot?.renderCode(CodeLanguages.PYTHON, "") ?? <span style={{ color: "#569CD6", fontStyle: "normal" }}>None</span>}
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        this.activeLineKeys = [`${this.id}-line`];
        yield { type: 'step', widget: this };
        
        // Evaluate the value from the slot (async to support user input)
        const value = await this.slots.valueSlot?.evaluate();

        // Update the execution stack with this variable's name and value
        if (this.targetVariable) {
            this.targetVariable.setValue(value);
        }
        
        this.activeLineKeys = [];
    }

    private getAvailableVariables(): VariableOption[] {
        const variableStack = this.executor.getVariableStack();
        return Object.entries(variableStack)
            .filter(([_, variable]) => !variable.isConstant)
            .map(([id, variable]) => ({
                id,
                name: variable.getName(),
            }));
    }

    async openConfig(): Promise<boolean> {
        const variables = this.getAvailableVariables();

        const result = await configModal.open({
            title: "Select Variable",
            initialValues: {
                selectedVariableId: this.targetVariable?.id ?? "",
            } as SetVarConfig,
            validate: validateSetVarConfig,
            renderContent: (props) => (
                <SetVarConfigForm {...props} variables={variables} />
            ),
        });

        if (result) {
            const variableStack = this.executor.getVariableStack();
            this.targetVariable = variableStack[result.selectedVariableId] ?? null;
            return true;
        }
        return false;
    }

    async initWidget(): Promise<void> {
        await this.openConfig();
    }

    registerSlot(widget: GenericWidgetBase, slotId: string): void {
        this.slots[slotId] = widget;
    }

    unregisterSlot(slotId: string): void {
        this.slots[slotId] = null;
    }

    cleanup(): void {
        this.targetVariable = null;
        if (this.slots.valueSlot) {
            this.executor.deleteWidget(this.slots.valueSlot.id);
        }
    }
}
