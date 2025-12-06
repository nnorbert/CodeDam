import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import CreaveVarComponent from "./component";

export class CreateVarWidget extends GenericWidgetBase {

    public static getType(): string {
        return "createVar";
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Create Variable</div>;
    }

    render(): React.ReactNode {
        return <CreaveVarComponent widget={this}></CreaveVarComponent>;
    }

    renderCode(): string {
        return "Var X";
    }

    execute(): void {
        console.log("CreateVarWidget execute");
    }
}
