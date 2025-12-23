import { configModal } from "../../../../../components/ConfigModal";
import { userInputModal } from "../../../../../components/UserInputModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import UserInputComponent from "./component";
import { UserInputConfigForm, validateUserInputConfig } from "./UserInputConfigForm";

export class UserInputWidget extends GenericWidgetBase {

    public static getType(): string {
        return "userInput";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.INTERACTIONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>User Input</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.EXPRESSION;
    }

    // ------------------------------

    private title: string = "Enter a value";

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    getTitle(): string {
        return this.title;
    }

    render(): React.ReactNode {
        return <UserInputComponent widget={this} />;
    }

    renderCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        return (
            <span style={highlightStyle}>
                <span style={{ color: "#DCDCAA" }}>prompt</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                <span style={{ color: "#CE9178" }}>"{this.title}"</span>
                <span style={{ color: "#D4D4D4" }}>)</span>
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        // Expression widgets don't yield steps - they're evaluated via evaluate()
    }

    async evaluate(): Promise<string | null> {
        // Capture user input when evaluated
        return await userInputModal.open(this.title, {
            placeholder: "Enter value...",
        });
    }

    async openConfig(): Promise<boolean> {
        const result = await configModal.open({
            title: "Configure User Input",
            initialValues: { title: this.title },
            validate: validateUserInputConfig,
            renderContent: (props) => <UserInputConfigForm {...props} />,
        });

        if (result) {
            this.title = result.title as string;
            return true;
        }
        return false;
    }

    async initWidget(): Promise<void> {
        await this.openConfig();
    }

    cleanup(): void {
        // Nothing to clean up
    }
}

