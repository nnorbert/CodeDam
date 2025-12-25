import { configModal } from "../../../../../components/ConfigModal";
import { userInputModal } from "../../../../../components/UserInputModal";
import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import UserInputComponent from "./component";
import { UserInputConfigForm, validateUserInputConfig, type UserInputValueType } from "./UserInputConfigForm";

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
    private valueType: UserInputValueType = "text";

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    getTitle(): string {
        return this.title;
    }

    getValueType(): UserInputValueType {
        return this.valueType;
    }

    render(): React.ReactNode {
        return <UserInputComponent widget={this} />;
    }

    renderCode(language: CodeLanguageType, _indent: string = ""): React.ReactNode {
        if (language === CodeLanguages.PYTHON) {
            return this.renderPythonCode();
        }
        return this.renderJavaScriptCode();
    }

    private renderJavaScriptCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        const inputCall = (
            <>
                <span style={{ color: "#DCDCAA" }}>prompt</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                <span style={{ color: "#CE9178" }}>"{this.title}"</span>
                <span style={{ color: "#D4D4D4" }}>)</span>
            </>
        );

        if (this.valueType === "number") {
            return (
                <span style={highlightStyle}>
                    <span style={{ color: "#DCDCAA" }}>Number</span>
                    <span style={{ color: "#D4D4D4" }}>(</span>
                    {inputCall}
                    <span style={{ color: "#D4D4D4" }}>)</span>
                </span>
            );
        }

        return (
            <span style={highlightStyle}>
                {inputCall}
            </span>
        );
    }

    private renderPythonCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        const inputCall = (
            <>
                <span style={{ color: "#DCDCAA" }}>input</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                <span style={{ color: "#CE9178" }}>"{this.title}: "</span>
                <span style={{ color: "#D4D4D4" }}>)</span>
            </>
        );

        if (this.valueType === "number") {
            return (
                <span style={highlightStyle}>
                    <span style={{ color: "#DCDCAA" }}>int</span>
                    <span style={{ color: "#D4D4D4" }}>(</span>
                    {inputCall}
                    <span style={{ color: "#D4D4D4" }}>)</span>
                </span>
            );
        }

        return (
            <span style={highlightStyle}>
                {inputCall}
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        // Expression widgets don't yield steps - they're evaluated via evaluate()
    }

    async evaluate(): Promise<string | number | null> {
        // Capture user input when evaluated
        const rawValue = await userInputModal.open(this.title, {
            placeholder: "Enter value...",
        });

        if (rawValue === null) {
            return null;
        }

        if (this.valueType === "number") {
            const numValue = Number(rawValue);
            return isNaN(numValue) ? 0 : numValue;
        }

        return rawValue;
    }

    async openConfig(): Promise<boolean> {
        const result = await configModal.open({
            title: "Configure User Input",
            initialValues: { title: this.title, valueType: this.valueType },
            validate: validateUserInputConfig,
            renderContent: (props) => <UserInputConfigForm {...props} />,
        });

        if (result) {
            this.title = result.title as string;
            this.valueType = result.valueType as UserInputValueType;
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

