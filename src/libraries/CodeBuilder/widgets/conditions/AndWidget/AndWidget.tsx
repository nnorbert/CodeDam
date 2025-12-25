import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import AndComponent from "./component";

export class AndWidget extends GenericWidgetBase {

    public static getType(): string {
        return "and";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.COMPARISONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>And (&&)</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.EXPRESSION;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {
        leftOperand: null,
        rightOperand: null
    };

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    render(): React.ReactNode {
        return <AndComponent widget={this} />;
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
                <span style={{ color: "#D4D4D4" }}>(</span>
                {this.slots.leftOperand?.renderCode(CodeLanguages.JAVASCRIPT, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* left */</span>}
                <span style={{ color: "#569CD6" }}> && </span>
                {this.slots.rightOperand?.renderCode(CodeLanguages.JAVASCRIPT, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* right */</span>}
                <span style={{ color: "#D4D4D4" }}>)</span>
            </span>
        );
    }

    private renderPythonCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        return (
            <span style={highlightStyle}>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {this.slots.leftOperand?.renderCode(CodeLanguages.PYTHON, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}># left</span>}
                <span style={{ color: "#569CD6" }}> and </span>
                {this.slots.rightOperand?.renderCode(CodeLanguages.PYTHON, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}># right</span>}
                <span style={{ color: "#D4D4D4" }}>)</span>
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        // Expression widgets don't yield steps - they're evaluated synchronously
    }

    async evaluate(): Promise<unknown> {
        const left = await this.slots.leftOperand?.evaluate();
        const right = await this.slots.rightOperand?.evaluate();
        
        return left && right;
    }

    async initWidget(): Promise<void> {
        // No configuration needed
    }

    registerSlot(widget: GenericWidgetBase, slotId: string): void {
        this.slots[slotId] = widget;
    }

    unregisterSlot(slotId: string): void {
        this.slots[slotId] = null;
    }

    cleanup(): void {
        if (this.slots.leftOperand) {
            this.executor.deleteWidget(this.slots.leftOperand.id, true);
        }
        if (this.slots.rightOperand) {
            this.executor.deleteWidget(this.slots.rightOperand.id, true);
        }
    }
}

