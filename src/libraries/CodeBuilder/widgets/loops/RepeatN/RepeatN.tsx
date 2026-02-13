import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import { LoopIndexVariable } from "./LoopIndexVariable";
import RepeatNComponent from "./component";

export class RepeatNWidget extends GenericWidgetBase {

    public static getType(): string {
        return "repeat-n";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.LOOPS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div title="Repeat N">Repeat N</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.STATEMENT;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {
        countSlot: null
    };

    /** Internal executor for the loop body; index variable is in this scope */
    public bodyExecutor: Executor;

    /** Synthetic variable "index" in body scope; widget sets its value each iteration */
    private loopIndexVariable: LoopIndexVariable;

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
        this.bodyExecutor = new Executor(`canvas-${this.id}`, executor, "Repeat N Block");
        this.bodyExecutor.setOnChange(() => {
            this.getExecutor().notifyChange();
        });
        this.loopIndexVariable = new LoopIndexVariable(this.bodyExecutor);
        this.bodyExecutor.registerVariable(this.loopIndexVariable);
    }

    getBodyCanvasId(): string {
        return this.bodyExecutor.getContainerId();
    }

    getNestedExecutors(): Executor[] {
        return [this.bodyExecutor];
    }

    render(): React.ReactNode {
        return <RepeatNComponent widget={this}></RepeatNComponent>;
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

        // for (let index = 0; index < N; index++) {
        const forLineKey = `${this.id}-for`;
        lines.push(
            <span key={forLineKey}>
                {indent}<span style={{ color: "#C586C0", fontStyle: "normal" }}>for</span>
                <span style={{ color: "#D4D4D4" }}> (</span>
                <span style={{ color: "#569CD6", fontStyle: "normal" }}>let</span>
                <span style={{ color: "#D4D4D4" }}> </span>
                <span style={{ color: "#9CDCFE", fontStyle: "normal" }}>index</span>
                <span style={{ color: "#D4D4D4" }}> = </span>
                <span style={{ color: "#B5CEA8", fontStyle: "normal" }}>0</span>
                <span style={{ color: "#D4D4D4" }}>; </span>
                <span style={{ color: "#9CDCFE", fontStyle: "normal" }}>index</span>
                <span style={{ color: "#D4D4D4" }}> &lt; </span>
                {this.slots.countSlot?.renderCode(CodeLanguages.JAVASCRIPT, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* N */</span>}
                <span style={{ color: "#D4D4D4" }}>; </span>
                <span style={{ color: "#9CDCFE", fontStyle: "normal" }}>index</span>
                <span style={{ color: "#D4D4D4" }}>++) {"{"}</span>
            </span>
        );

        if (bodyWidgets.length > 0) {
            bodyWidgets.forEach((widget) => {
                const widgetCode = widget.renderCode(CodeLanguages.JAVASCRIPT, childIndent);
                const widgetLines = Array.isArray(widgetCode) ? widgetCode : [widgetCode];
                widgetLines.forEach((line) => lines.push(line));
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

        // for index in range(N):
        const forLineKey = `${this.id}-for`;
        lines.push(
            <span key={forLineKey}>
                {indent}<span style={{ color: "#C586C0", fontStyle: "normal" }}>for</span>
                <span style={{ color: "#D4D4D4" }}> </span>
                <span style={{ color: "#9CDCFE", fontStyle: "normal" }}>index</span>
                <span style={{ color: "#D4D4D4" }}> </span>
                <span style={{ color: "#C586C0", fontStyle: "normal" }}>in</span>
                <span style={{ color: "#D4D4D4" }}> </span>
                <span style={{ color: "#4EC9B0", fontStyle: "normal" }}>range</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {this.slots.countSlot?.renderCode(CodeLanguages.PYTHON, "") ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}># N</span>}
                <span style={{ color: "#D4D4D4" }}>):</span>
            </span>
        );

        if (bodyWidgets.length > 0) {
            bodyWidgets.forEach((widget) => {
                const widgetCode = widget.renderCode(CodeLanguages.PYTHON, childIndent);
                const widgetLines = Array.isArray(widgetCode) ? widgetCode : [widgetCode];
                widgetLines.forEach((line) => lines.push(line));
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
        const forLineKey = `${this.id}-for`;
        const closeLineKey = `${this.id}-close`;

        const nRaw = await this.slots.countSlot?.evaluate();
        const n = Math.max(0, Math.floor(Number(nRaw) ?? 0));

        for (let i = 0; i < n; i++) {
            this.activeLineKeys = [forLineKey];
            yield { type: 'step', widget: this };

            this.loopIndexVariable.setValue(i);

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
        this.bodyExecutor.unregisterVariable(this.loopIndexVariable.id);

        if (this.slots.countSlot) {
            this.executor.deleteWidget(this.slots.countSlot.id, true);
        }

        this.bodyExecutor.getWidgets().forEach((w) => {
            this.bodyExecutor.deleteWidget(w.id, true);
        });
    }
}
