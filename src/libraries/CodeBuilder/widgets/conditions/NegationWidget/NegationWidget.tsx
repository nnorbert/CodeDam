import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import NegationComponent from "./component";

export class NegationWidget extends GenericWidgetBase {

    public static getType(): string {
        return "negation";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.COMPARISONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Not (!)</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.EXPRESSION;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {
        value: null
    };

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    render(): React.ReactNode {
        return <NegationComponent widget={this} />;
    }

    renderCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        return (
            <span style={highlightStyle}>
                <span style={{ color: "#C586C0" }}>!</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {this.slots.value?.renderCode() ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* value */</span>}
                <span style={{ color: "#D4D4D4" }}>)</span>
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        // Expression widgets don't yield steps - they're evaluated synchronously
    }

    async evaluate(): Promise<boolean> {
        const value = await this.slots.value?.evaluate();
        return !value;
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
        if (this.slots.value) {
            this.executor.deleteWidget(this.slots.value.id, true);
        }
    }
}

