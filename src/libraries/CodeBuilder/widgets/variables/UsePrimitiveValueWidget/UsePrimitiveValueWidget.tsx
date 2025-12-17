import { userInputModal } from "../../../../../components/UserInputModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import UsePrimitiveValueComponent from "./component";

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

    private value: string | number | boolean | null = null;


    constructor(executor: Executor) {
        super(executor);
    }

    render(): React.ReactNode {
        return <UsePrimitiveValueComponent widget={this} value={this.value}></UsePrimitiveValueComponent>;
    }

    renderCode(): string {
        return `TEST`;
    }

    execute(): string | number | boolean | null {
        return this.value;
    }

    async initWidget(): Promise<void> {
        const result = await userInputModal.open(
            "Enter Value",
            {  }
        );
        
        if (result) {
            this.value = result;
        }
    }

    cleanup(): void {
        // Nothing to do
    }
}
