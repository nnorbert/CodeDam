import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import ModuloComponent from "./component";

export class ModuloWidget extends GenericWidgetBase {

    public static getType(): string {
        return "modulo";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.OPERATIONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Modulo (%)</div>;
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
        return <ModuloComponent widget={this} />;
    }

    renderCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        return (
            <span style={highlightStyle}>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {this.slots.leftOperand?.renderCode() ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* left */</span>}
                <span style={{ color: "#D4D4D4" }}> % </span>
                {this.slots.rightOperand?.renderCode() ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* right */</span>}
                <span style={{ color: "#D4D4D4" }}>)</span>
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        // Expression widgets don't yield steps - they're evaluated synchronously
    }

    evaluate(): number {
        const left = this.slots.leftOperand?.evaluate();
        const right = this.slots.rightOperand?.evaluate();
        
        const leftNum = typeof left === "number" ? left : Number(left) || 0;
        const rightNum = typeof right === "number" ? right : Number(right) || 0;
        
        return leftNum % rightNum;
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

