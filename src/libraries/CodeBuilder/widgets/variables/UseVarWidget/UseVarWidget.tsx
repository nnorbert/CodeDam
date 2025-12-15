import { userInputModal } from "../../../../../components/UserInputModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import UseVarComponent from "./component";
import CreaveVarComponent from "./component";

export class UseVarWidget extends GenericWidgetBase {

    public static getType(): string {
        return "useVar";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.VARIABLES;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Use Variable</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.EXPRESSION;
    }

    private value: GenericWidgetBase | null = null;


    constructor(executor: Executor) {
        super(executor);
    }

    render(): React.ReactNode {
        return <UseVarComponent widget={this}></UseVarComponent>;
    }

    renderCode(): string {
        return `TEST`;
    }

    execute(): void {
        console.log("UseVarWidget execute");
    }

    async initWidget(): Promise<void> {
        // Nothing to do
    }
}
