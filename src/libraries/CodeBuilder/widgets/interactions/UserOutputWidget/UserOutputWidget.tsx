import { userOutputModal } from "../../../../../components/UserOutputModal";
import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import UserOutputComponent from "./component";

export class UserOutputWidget extends GenericWidgetBase {

    public static getType(): string {
        return "userOutput";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.INTERACTIONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>User Output</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.STATEMENT;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {
        valueSlot: null
    };

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    render(): React.ReactNode {
        return <UserOutputComponent widget={this} />;
    }

    renderCode(language: CodeLanguageType, indent: string = ""): React.ReactNode {
        if (language === CodeLanguages.PYTHON) {
            return this.renderPythonCode(indent);
        }
        return this.renderJavaScriptCode(indent);
    }

    private renderJavaScriptCode(indent: string): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        return (
            <span style={highlightStyle}>
                {indent}<span style={{ color: "#DCDCAA" }}>alert</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {this.slots.valueSlot?.renderCode(CodeLanguages.JAVASCRIPT, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* value */</span>}
                <span style={{ color: "#D4D4D4" }}>);</span>
            </span>
        );
    }

    private renderPythonCode(indent: string): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        return (
            <span style={highlightStyle}>
                {indent}<span style={{ color: "#DCDCAA" }}>print</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {this.slots.valueSlot?.renderCode(CodeLanguages.PYTHON, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}># value</span>}
                <span style={{ color: "#D4D4D4" }}>)</span>
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        yield { type: 'step', widget: this };
        
        // Evaluate the value from the slot (async to support user input)
        const value = await this.slots.valueSlot?.evaluate();
        
        // Show the output modal and wait for user to acknowledge
        await userOutputModal.open(value);
    }

    async initWidget(): Promise<void> {
        // No configuration needed for this widget
    }

    registerSlot(widget: GenericWidgetBase, slotId: string): void {
        this.slots[slotId] = widget;
    }

    unregisterSlot(slotId: string): void {
        this.slots[slotId] = null;
    }

    cleanup(): void {
        if (this.slots.valueSlot) {
            this.executor.deleteWidget(this.slots.valueSlot.id, true);
        }
    }
}

