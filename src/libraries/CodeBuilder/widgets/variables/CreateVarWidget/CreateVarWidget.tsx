import { userInputModal } from "../../../../../components/UserInputModal";
import { WidgetCategory, type WidgetCategoryType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
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

    private name: string = "";
    private value: GenericWidgetBase | null = null;

    getName(): string {
        return this.name;
    }

    render(): React.ReactNode {
        return <CreaveVarComponent widget={this}></CreaveVarComponent>;
    }

    renderCode(): string {
        return `let ${this.name || "unnamed"}`;
    }

    execute(): void {
        console.log("CreateVarWidget execute");
    }

    async initWidget(): Promise<void> {
        const result = await userInputModal.open(
            "Enter Variable Name",
            "e.g. myVariable"
        );
        
        if (result) {
            this.name = result;
        }
    }
}
