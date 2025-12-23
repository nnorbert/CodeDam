import { configModal } from "../../../../../components/ConfigModal";
import { userOutputModal } from "../../../../../components/UserOutputModal";
import { WidgetCategory, WidgetRoles, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import UserOutputComponent from "./component";
import { UserOutputConfigForm, validateUserOutputConfig } from "./UserOutputConfigForm";

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

    private title: string = "Output";

    public slots: Record<string, GenericWidgetBase | null> = {
        valueSlot: null
    };

    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
    }

    getTitle(): string {
        return this.title;
    }

    render(): React.ReactNode {
        return <UserOutputComponent widget={this} />;
    }

    renderCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)", display: "block" }
            : { display: "block" };

        return (
            <div style={highlightStyle}>
                <span style={{ color: "#DCDCAA" }}>alert</span>
                <span style={{ color: "#D4D4D4" }}>(</span>
                <span style={{ color: "#CE9178" }}>"{this.title}"</span>
                <span style={{ color: "#D4D4D4" }}>, </span>
                {this.slots.valueSlot?.renderCode() ?? <span style={{ color: "#6A9955", fontStyle: "italic" }}>/* value */</span>}
                <span style={{ color: "#D4D4D4" }}>);</span>
            </div>
        );
    }

    async *execute(): ExecutionGenerator {
        yield { type: 'step', widget: this };
        
        // Evaluate the value from the slot (async to support user input)
        const value = await this.slots.valueSlot?.evaluate();
        
        // Show the output modal and wait for user to acknowledge
        await userOutputModal.open(this.title, value);
    }

    async openConfig(): Promise<boolean> {
        const result = await configModal.open({
            title: "Configure User Output",
            initialValues: { title: this.title },
            validate: validateUserOutputConfig,
            renderContent: (props) => <UserOutputConfigForm {...props} />,
        });

        if (result) {
            this.title = result.title as string;
            return true;
        }
        return false;
    }

    async initWidget(): Promise<void> {
        await this.openConfig();
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

