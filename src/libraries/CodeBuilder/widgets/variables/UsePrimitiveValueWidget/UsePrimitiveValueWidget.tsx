import { configModal } from "../../../../../components/ConfigModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import UsePrimitiveValueComponent from "./component";
import {
    UsePrimitiveValueConfigForm,
    validateUsePrimitiveValueConfig,
    getConfigFromValue,
    getValueFromConfig,
} from "./UsePrimitiveValueConfigForm";

export class UsePrimitiveValueWidget extends GenericWidgetBase {

    public static getType(): string {
        return "usePrimitiveValue";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.VARIABLES;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Use Value</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.EXPRESSION;
    }

    private value: string | number | boolean | null | undefined = null;

    public inExecution: boolean = false;
    
    constructor(executor: Executor) {
        super(executor);
    }

    getValue(): string | number | boolean | null | undefined {
        return this.value;
    }

    render(): React.ReactNode {
        return <UsePrimitiveValueComponent widget={this} value={this.value}></UsePrimitiveValueComponent>;
    }

    renderCode(): React.ReactNode {
        // VS Code Dark+ theme colors by type
        if (this.value === null) {
            return <span style={{ color: "#569CD6", fontStyle: "normal" }}>null</span>;
        }
        if (this.value === undefined) {
            return <span style={{ color: "#569CD6", fontStyle: "normal" }}>undefined</span>;
        }
        if (typeof this.value === "string") {
            return <span style={{ color: "#CE9178", fontStyle: "normal" }}>"{this.value}"</span>;
        }
        if (typeof this.value === "number") {
            return <span style={{ color: "#B5CEA8", fontStyle: "normal" }}>{this.value}</span>;
        }
        if (typeof this.value === "boolean") {
            return <span style={{ color: "#569CD6", fontStyle: "normal" }}>{this.value ? "true" : "false"}</span>;
        }
        return <span style={{ color: "#569CD6", fontStyle: "normal" }}>unknown</span>;
    }

    async *execute(): ExecutionGenerator {
        // Expression widgets don't yield steps - they're evaluated synchronously
    }

    evaluate(): string | number | boolean | null | undefined {
        return this.value;
    }

    async openConfig(isEditing = false): Promise<boolean> {
        const result = await configModal.open({
            title: "Configure Value",
            initialValues: getConfigFromValue(this.value, isEditing),
            validate: validateUsePrimitiveValueConfig,
            renderContent: (props) => <UsePrimitiveValueConfigForm {...props} />,
        });

        if (result) {
            this.value = getValueFromConfig(result);
            return true;
        }
        return false;
    }

    async initWidget(): Promise<void> {
        await this.openConfig(false);
    }

    cleanup(): void {
        // Nothing to do
    }
}
