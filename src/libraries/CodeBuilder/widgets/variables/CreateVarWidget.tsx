import { GenericWidgetBase } from "../../baseClasses/GenericWidgetBase";

export class CreateVarWidget extends GenericWidgetBase {

    public static getType(): string {
        return "create-var";
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Create Variable</div>;
    }
}
