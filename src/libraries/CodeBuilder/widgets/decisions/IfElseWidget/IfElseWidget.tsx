import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import IfElseComponent from "./component";

export class IfElseWidget extends GenericWidgetBase {

    public static getType(): string {
        return "if-else";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.DECISIONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>If-Else Decision</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.STATEMENT;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {
        conditionSlot: null
    };

    /** Internal executor for managing the "then" branch widgets */
    public thenExecutor: Executor;

    /** Internal executor for managing the "else" branch widgets */
    public elseExecutor: Executor;

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
        // Create internal executors with canvas ID based on widget ID
        // Pass parent executor so nested widgets can access parent's variable stack
        this.thenExecutor = new Executor(`canvas-${this.id}-then`, executor, "If Block");
        this.thenExecutor.setOnChange(() => {
            this.getExecutor().notifyChange();
        });

        this.elseExecutor = new Executor(`canvas-${this.id}-else`, executor, "Else Block");
        this.elseExecutor.setOnChange(() => {
            this.getExecutor().notifyChange();
        });
    }

    /** Returns the canvas ID for the "then" body droppable area */
    getThenCanvasId(): string {
        return this.thenExecutor.getContainerId();
    }

    /** Returns the canvas ID for the "else" body droppable area */
    getElseCanvasId(): string {
        return this.elseExecutor.getContainerId();
    }

    getNestedExecutors(): Executor[] {
        return [this.thenExecutor, this.elseExecutor];
    }

    render(): React.ReactNode {
        return <IfElseComponent widget={this}></IfElseComponent>;
    }

    renderCode(language: CodeLanguageType, indent: string = ""): React.ReactNode[] {
        if (language === CodeLanguages.PYTHON) {
            return this.renderPythonCode(indent);
        }
        return this.renderJavaScriptCode(indent);
    }

    private renderJavaScriptCode(indent: string): React.ReactNode[] {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        const thenWidgets = this.thenExecutor.getWidgets();
        const elseWidgets = this.elseExecutor.getWidgets();
        const childIndent = indent + "    "; // Add 4 spaces for nested content
        const lines: React.ReactNode[] = [];

        // JavaScript: if (condition) {
        lines.push(
            <span key={`${this.id}-if`} style={highlightStyle}>
                {indent}<span style={{ color: "#C586C0", fontStyle: "normal" }}>if</span>
                <span style={{ color: "#D4D4D4" }}> (</span>
                {this.slots.conditionSlot?.renderCode(CodeLanguages.JAVASCRIPT, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* condition */</span>}
                <span style={{ color: "#D4D4D4" }}>) {"{"}</span>
            </span>
        );

        // "Then" body widgets
        if (thenWidgets.length > 0) {
            thenWidgets.forEach((widget) => {
                const widgetCode = widget.renderCode(CodeLanguages.JAVASCRIPT, childIndent);
                const widgetLines = Array.isArray(widgetCode) ? widgetCode : [widgetCode];
                widgetLines.forEach((line, index) => {
                    lines.push(
                        <span key={`${widget.id}-${index}`}>{line}</span>
                    );
                });
            });
        } else {
            lines.push(
                <span key={`${this.id}-then-empty`} style={{ color: "#6A9955", fontStyle: "italic" }}>
                    {childIndent}{"// empty body"}
                </span>
            );
        }

        // } else {
        lines.push(
            <span key={`${this.id}-else`} style={highlightStyle}>
                {indent}<span style={{ color: "#D4D4D4" }}>{"}"}</span>
                <span style={{ color: "#C586C0", fontStyle: "normal" }}> else</span>
                <span style={{ color: "#D4D4D4" }}> {"{"}</span>
            </span>
        );

        // "Else" body widgets
        if (elseWidgets.length > 0) {
            elseWidgets.forEach((widget) => {
                const widgetCode = widget.renderCode(CodeLanguages.JAVASCRIPT, childIndent);
                const widgetLines = Array.isArray(widgetCode) ? widgetCode : [widgetCode];
                widgetLines.forEach((line, index) => {
                    lines.push(
                        <span key={`${widget.id}-else-${index}`}>{line}</span>
                    );
                });
            });
        } else {
            lines.push(
                <span key={`${this.id}-else-empty`} style={{ color: "#6A9955", fontStyle: "italic" }}>
                    {childIndent}{"// empty body"}
                </span>
            );
        }

        // Closing brace
        lines.push(
            <span key={`${this.id}-close`}>
                {indent}<span style={{ color: "#D4D4D4" }}>{"}"}</span>
            </span>
        );

        return lines;
    }

    private renderPythonCode(indent: string): React.ReactNode[] {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        const thenWidgets = this.thenExecutor.getWidgets();
        const elseWidgets = this.elseExecutor.getWidgets();
        const childIndent = indent + "    "; // Add 4 spaces for nested content
        const lines: React.ReactNode[] = [];

        // Python: if condition:
        lines.push(
            <span key={`${this.id}-if`} style={highlightStyle}>
                {indent}<span style={{ color: "#C586C0", fontStyle: "normal" }}>if</span>
                <span style={{ color: "#D4D4D4" }}> </span>
                {this.slots.conditionSlot?.renderCode(CodeLanguages.PYTHON, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}># condition</span>}
                <span style={{ color: "#D4D4D4" }}>:</span>
            </span>
        );

        // "Then" body widgets
        if (thenWidgets.length > 0) {
            thenWidgets.forEach((widget) => {
                const widgetCode = widget.renderCode(CodeLanguages.PYTHON, childIndent);
                const widgetLines = Array.isArray(widgetCode) ? widgetCode : [widgetCode];
                widgetLines.forEach((line, index) => {
                    lines.push(
                        <span key={`${widget.id}-${index}`}>{line}</span>
                    );
                });
            });
        } else {
            lines.push(
                <span key={`${this.id}-then-empty`}>
                    {childIndent}<span style={{ color: "#569CD6", fontStyle: "normal" }}>pass</span>
                </span>
            );
        }

        // else:
        lines.push(
            <span key={`${this.id}-else`} style={highlightStyle}>
                {indent}<span style={{ color: "#C586C0", fontStyle: "normal" }}>else</span>
                <span style={{ color: "#D4D4D4" }}>:</span>
            </span>
        );

        // "Else" body widgets
        if (elseWidgets.length > 0) {
            elseWidgets.forEach((widget) => {
                const widgetCode = widget.renderCode(CodeLanguages.PYTHON, childIndent);
                const widgetLines = Array.isArray(widgetCode) ? widgetCode : [widgetCode];
                widgetLines.forEach((line, index) => {
                    lines.push(
                        <span key={`${widget.id}-else-${index}`}>{line}</span>
                    );
                });
            });
        } else {
            lines.push(
                <span key={`${this.id}-else-empty`}>
                    {childIndent}<span style={{ color: "#569CD6", fontStyle: "normal" }}>pass</span>
                </span>
            );
        }

        return lines;
    }

    async *execute(): ExecutionGenerator {
        yield { type: 'step', widget: this };
        
        // Evaluate the condition from the slot (async to support user input)
        const condition = await this.slots.conditionSlot?.evaluate();
        
        // If condition is truthy, execute the "then" branch, otherwise execute the "else" branch
        if (condition) {
            yield* this.thenExecutor.execute();
        } else {
            yield* this.elseExecutor.execute();
        }
    }

    async initWidget(): Promise<void> {
        // Nothing to do
    }

    registerSlot(widget: GenericWidgetBase, slotId: string): void {
        this.slots[slotId] = widget;
    }

    unregisterSlot(slotId: string): void {
        this.slots[slotId] = null;
    }

    cleanup(): void {
        if (this.slots.conditionSlot) {
            this.executor.deleteWidget(this.slots.conditionSlot.id, true);
        }

        this.thenExecutor.getWidgets().forEach((w) => {
            this.thenExecutor.deleteWidget(w.id, true);
        });

        this.elseExecutor.getWidgets().forEach((w) => {
            this.elseExecutor.deleteWidget(w.id, true);
        });
    }
}

