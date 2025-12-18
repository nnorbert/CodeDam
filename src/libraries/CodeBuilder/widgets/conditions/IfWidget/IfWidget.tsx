import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import { Executor } from "../../../Executor";
import IfComponent from "./component";

export class IfWidget extends GenericWidgetBase {

    public static getType(): string {
        return "if";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.CONDITIONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>If Condition</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.STATEMENT;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {
        conditionSlot: null
    };

    /** Internal executor for managing body widgets */
    public bodyExecutor: Executor;

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
        // Create internal executor with canvas ID based on widget ID
        // Pass parent executor so nested widgets can access parent's variable stack
        this.bodyExecutor = new Executor(`canvas-${this.id}`, executor);
        this.bodyExecutor.setOnChange(() => {
            this.getExecutor().notifyChange();
        });
    }

    /** Returns the canvas ID for the body droppable area */
    getBodyCanvasId(): string {
        return this.bodyExecutor.getContainerId();
    }

    getNestedExecutors(): Executor[] {
        return [this.bodyExecutor];
    }

    render(): React.ReactNode {
        return <IfComponent widget={this}></IfComponent>;
    }

    renderCode(): React.ReactNode[] {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        const bodyWidgets = this.bodyExecutor.getWidgets();
        const indentStyle = { paddingLeft: "2ch" };

        const lines: React.ReactNode[] = [];

        // if (condition) {
        lines.push(
            <div key={`${this.id}-if`} style={highlightStyle}>
                <span style={{ color: "#C586C0", fontStyle: "normal" }}>if</span>
                <span style={{ color: "#D4D4D4" }}> (</span>
                {this.slots.conditionSlot?.renderCode() ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* condition */</span>}
                <span style={{ color: "#D4D4D4" }}>) {"{"}</span>
            </div>
        );

        // Body widgets - each line indented
        if (bodyWidgets.length > 0) {
            bodyWidgets.forEach((widget) => {
                const widgetCode = widget.renderCode();
                // Handle both single nodes and arrays of nodes
                const widgetLines = Array.isArray(widgetCode) ? widgetCode : [widgetCode];
                widgetLines.forEach((line, index) => {
                    lines.push(
                        <div key={`${widget.id}-${index}`} style={indentStyle}>
                            {line}
                        </div>
                    );
                });
            });
        } else {
            lines.push(
                <div key={`${this.id}-empty`} style={{ ...indentStyle, color: "#6A9955", fontStyle: "italic" }}>
                    {"// empty body"}
                </div>
            );
        }

        // Closing brace
        lines.push(
            <div key={`${this.id}-close`}>
                <span style={{ color: "#D4D4D4" }}>{"}"}</span>
            </div>
        );

        return lines;
    }

    execute(): void {
        // Execute
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
