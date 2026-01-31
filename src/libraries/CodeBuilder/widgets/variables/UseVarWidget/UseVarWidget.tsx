import { configModal } from "../../../../../components/ConfigModal";
import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import type { IGenericWidget } from "../../../interfaces/IGenericWidget";
import UseVarComponent from "./component";
import type { IVariable } from "../../../interfaces/IVariable";
import { UseVarConfigForm, validateUseVarConfig, type UseVarConfig, type VariableOption } from "./UseVarConfigForm";

export class UseVarWidget extends GenericWidgetBase {

    public static getType(): string {
        return "useVar";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.VARIABLES;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div title="Use Variable">Use Variable</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.EXPRESSION;
    }

    private valueProvider: (IGenericWidget & IVariable) | null = null;

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    getValueProvider(): (IGenericWidget & IVariable) | null {
        return this.valueProvider;
    }

    getVariableName(): string {
        return this.valueProvider?.getName() ?? "";
    }

    getReferencedVariableIds(): string[] {
        return this.valueProvider ? [this.valueProvider.id] : [];
    }

    render(): React.ReactNode {
        return <UseVarComponent widget={this}></UseVarComponent>;
    }

    renderCode(language: CodeLanguageType, _indent: string = ""): React.ReactNode {
        // VS Code Dark+ theme colors by type
        let name = this.valueProvider?.getName() ?? "undefined";

        // Python convention: constants are uppercase
        if (language === CodeLanguages.PYTHON && this.valueProvider?.isConstant) {
            name = name.toUpperCase();
        }

        return (
            <span style={{ color: "#9CDCFE", fontStyle: "normal" }}>
                {name}
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        // Expression widgets don't yield steps - they're evaluated synchronously
    }

    async evaluate(): Promise<unknown> {
        return this.valueProvider?.getValue();
    }

    private getAvailableVariables(): VariableOption[] {
        const variableStack = this.executor.getVariableStack();
        return Object.entries(variableStack).map(([id, variable]) => ({
            id,
            name: variable.getName(),
        }));
    }

    async openConfig(): Promise<boolean> {
        const variables = this.getAvailableVariables();

        const result = await configModal.open({
            title: "Select Variable",
            initialValues: {
                selectedVariableId: this.valueProvider?.id ?? "",
            } as UseVarConfig,
            validate: validateUseVarConfig,
            renderContent: (props) => (
                <UseVarConfigForm {...props} variables={variables} />
            ),
        });

        if (result) {
            const variableStack = this.executor.getVariableStack();
            this.valueProvider = variableStack[result.selectedVariableId] ?? null;
            return true;
        }
        return false;
    }

    async initWidget(): Promise<void> {
        await this.openConfig();
    }

    cleanup(): void {
        this.valueProvider = null;
    }
}
