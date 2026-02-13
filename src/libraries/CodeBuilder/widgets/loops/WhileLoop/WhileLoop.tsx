import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import WhileLoopComponent from "./component";

export class WhileLoopWidget extends GenericWidgetBase {

    public static getType(): string {
        return "while-loop";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.LOOPS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div title="While Loop">While Loop</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.STATEMENT;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {
        conditionSlot: null
    };

    /** Internal executor for managing the loop body widgets */
    public bodyExecutor: Executor;

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
        this.bodyExecutor = new Executor(`canvas-${this.id}`, executor, "While Block");
        this.bodyExecutor.setOnChange(() => {
            this.getExecutor().notifyChange();
        });
    }

    /** Returns the canvas ID for the loop body droppable area */
    getBodyCanvasId(): string {
        return this.bodyExecutor.getContainerId();
    }

    getNestedExecutors(): Executor[] {
        return [this.bodyExecutor];
    }

    render(): React.ReactNode {
        return <WhileLoopComponent widget={this}></WhileLoopComponent>;
    }

    renderCode(language: CodeLanguageType, indent: string = ""): React.ReactNode[] {
        if (language === CodeLanguages.PYTHON) {
            return this.renderPythonCode(indent);
        }
        return this.renderJavaScriptCode(indent);
    }

    private renderJavaScriptCode(indent: string): React.ReactNode[] {
        const bodyWidgets = this.bodyExecutor.getWidgets();
        const childIndent = indent + "    ";
        const lines: React.ReactNode[] = [];

        const whileLineKey = `${this.id}-while`;
        lines.push(
            <span key={whileLineKey}>
                {indent}<span style={{ color: "#C586C0", fontStyle: "normal" }}>while</span>
                <span style={{ color: "#D4D4D4" }}> (</span>
                {this.slots.conditionSlot?.renderCode(CodeLanguages.JAVASCRIPT, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* condition */</span>}
                <span style={{ color: "#D4D4D4" }}>) {"{"}</span>
            </span>
        );

        if (bodyWidgets.length > 0) {
            bodyWidgets.forEach((widget) => {
                const widgetCode = widget.renderCode(CodeLanguages.JAVASCRIPT, childIndent);
                const widgetLines = Array.isArray(widgetCode) ? widgetCode : [widgetCode];
                widgetLines.forEach((line) => {
                    lines.push(line);
                });
            });
        } else {
            lines.push(
                <span key={`${this.id}-empty`} style={{ color: "#6A9955", fontStyle: "italic" }}>
                    {childIndent}{"// empty body"}
                </span>
            );
        }

        const closeLineKey = `${this.id}-close`;
        lines.push(
            <span key={closeLineKey}>
                {indent}<span style={{ color: "#D4D4D4" }}>{"}"}</span>
            </span>
        );

        return lines;
    }

    private renderPythonCode(indent: string): React.ReactNode[] {
        const bodyWidgets = this.bodyExecutor.getWidgets();
        const childIndent = indent + "    ";
        const lines: React.ReactNode[] = [];

        const whileLineKey = `${this.id}-while`;
        lines.push(
            <span key={whileLineKey}>
                {indent}<span style={{ color: "#C586C0", fontStyle: "normal" }}>while</span>
                <span style={{ color: "#D4D4D4" }}> </span>
                {this.slots.conditionSlot?.renderCode(CodeLanguages.PYTHON, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}># condition</span>}
                <span style={{ color: "#D4D4D4" }}>:</span>
            </span>
        );

        if (bodyWidgets.length > 0) {
            bodyWidgets.forEach((widget) => {
                const widgetCode = widget.renderCode(CodeLanguages.PYTHON, childIndent);
                const widgetLines = Array.isArray(widgetCode) ? widgetCode : [widgetCode];
                widgetLines.forEach((line) => {
                    lines.push(line);
                });
            });
        } else {
            lines.push(
                <span key={`${this.id}-empty`}>
                    {childIndent}<span style={{ color: "#569CD6", fontStyle: "normal" }}>pass</span>
                </span>
            );
        }

        return lines;
    }

    async *execute(): ExecutionGenerator {
        const whileLineKey = `${this.id}-while`;
        const closeLineKey = `${this.id}-close`;

        while (true) {
            this.activeLineKeys = [whileLineKey];
            yield { type: 'step', widget: this };

            const condition = await this.slots.conditionSlot?.evaluate();
            if (!condition) {
                break;
            }

            this.activeLineKeys = [];
            yield* this.bodyExecutor.execute();

            this.activeLineKeys = [closeLineKey];
            yield { type: 'step', widget: this };
        }

        this.activeLineKeys = [];
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

        this.bodyExecutor.getWidgets().forEach((w) => {
            this.bodyExecutor.deleteWidget(w.id, true);
        });
    }
}
