import { configModal } from "../../../../../components/ConfigModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
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

    constructor(executor: Executor) {
        super(executor);
    }

    getValue(): string | number | boolean | null | undefined {
        return this.value;
    }

    render(): React.ReactNode {
        return <UsePrimitiveValueComponent widget={this} value={this.value}></UsePrimitiveValueComponent>;
    }

    renderCode(): string {
        if (this.value === null) return "null";
        if (this.value === undefined) return "undefined";
        if (typeof this.value === "string") return `"${this.value}"`;
        return String(this.value);
    }

    execute(): string | number | boolean | null | undefined {
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
