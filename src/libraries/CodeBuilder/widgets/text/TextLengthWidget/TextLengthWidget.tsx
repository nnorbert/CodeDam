import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import TextLengthComponent from "./component";

export class TextLengthWidget extends GenericWidgetBase {

    public static getType(): string {
        return "textLength";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.TEXT_OPERATIONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Text Length</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.EXPRESSION;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {
        textInput: null
    };

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    render(): React.ReactNode {
        return <TextLengthComponent widget={this} />;
    }

    renderCode(language: CodeLanguageType, _indent: string = ""): React.ReactNode {
        return language === CodeLanguages.PYTHON 
            ? this.renderPythonCode() 
            : this.renderJavaScriptCode();
    }

    private renderJavaScriptCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        return (
            <span style={highlightStyle}>
                <span style={{ color: "#569CD6" }}>String</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {this.slots.textInput?.renderCode(CodeLanguages.JAVASCRIPT, "") ?? <span style={{ color: "#CE9178" }}>""</span>}
                <span style={{ color: "#D4D4D4" }}>).</span>
                <span style={{ color: "#DCDCAA" }}>length</span>
            </span>
        );
    }

    private renderPythonCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        return (
            <span style={highlightStyle}>
                <span style={{ color: "#DCDCAA" }}>len</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                <span style={{ color: "#569CD6" }}>str</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {this.slots.textInput?.renderCode(CodeLanguages.PYTHON, "") ?? <span style={{ color: "#CE9178" }}>""</span>}
                <span style={{ color: "#D4D4D4" }}>))</span>
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        // Expression widgets don't yield steps - they're evaluated synchronously
    }

    async evaluate(): Promise<number> {
        const textValue = await this.slots.textInput?.evaluate();
        const text = String(textValue ?? "");
        return text.length;
    }

    async initWidget(): Promise<void> {
        // No configuration needed - widget is not configurable
    }

    registerSlot(widget: GenericWidgetBase, slotId: string): void {
        this.slots[slotId] = widget;
    }

    unregisterSlot(slotId: string): void {
        this.slots[slotId] = null;
    }

    cleanup(): void {
        if (this.slots.textInput) {
            this.executor.deleteWidget(this.slots.textInput.id, true);
        }
    }
}

