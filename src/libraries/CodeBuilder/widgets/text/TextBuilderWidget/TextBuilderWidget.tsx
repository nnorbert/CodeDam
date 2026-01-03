import { configModal } from "../../../../../components/ConfigModal";
import { CodeLanguages, WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import TextBuilderComponent from "./component";
import { TextBuilderConfigForm, createValidator, MAX_TEXT_COMPONENTS } from "./TextBuilderConfigForm";

export interface TextBuilderConfig extends Record<string, unknown> {
    componentCount: number;
    addSpaces: boolean;
}

export class TextBuilderWidget extends GenericWidgetBase {

    public static getType(): string {
        return "textBuilder";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.TEXT_OPERATIONS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return <div>Text Builder</div>;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.EXPRESSION;
    }

    // ------------------------------

    public slots: Record<string, GenericWidgetBase | null> = {};
    public componentCount: number = 2;
    public addSpaces: boolean = false;
    public inExecution: boolean = false;

    constructor(executor: Executor) {
        super(executor);
        // Initialize with default 2 slots
        this.initializeSlots(2);
    }

    private initializeSlots(count: number) {
        const newSlots: Record<string, GenericWidgetBase | null> = {};
        for (let i = 0; i < count; i++) {
            const slotKey = `component${i}`;
            // Preserve existing slot values if they exist
            newSlots[slotKey] = this.slots[slotKey] ?? null;
        }
        this.slots = newSlots;
        this.componentCount = count;
    }

    /**
     * Get the number of occupied slots (slots that have widgets)
     */
    getOccupiedSlotCount(): number {
        return Object.values(this.slots).filter(slot => slot !== null).length;
    }

    /**
     * Get the highest index of occupied slot (for determining minimum allowed slots)
     */
    getHighestOccupiedSlotIndex(): number {
        let highest = -1;
        for (let i = 0; i < this.componentCount; i++) {
            if (this.slots[`component${i}`] !== null) {
                highest = i;
            }
        }
        return highest;
    }

    render(): React.ReactNode {
        return <TextBuilderComponent widget={this} />;
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

        const separator = this.addSpaces ? " + ' ' + " : " + ";
        const components: React.ReactNode[] = [];

        for (let i = 0; i < this.componentCount; i++) {
            const slot = this.slots[`component${i}`];
            if (i > 0) {
                components.push(<span key={`sep-${i}`} style={{ color: "#D4D4D4" }}>{separator}</span>);
            }
            if (slot) {
                components.push(
                    <span key={`slot-${i}`}>
                        <span style={{ color: "#569CD6" }}>String</span>
                        <span style={{ color: "#D4D4D4" }}>(</span>
                        {slot.renderCode(CodeLanguages.JAVASCRIPT, "")}
                        <span style={{ color: "#D4D4D4" }}>)</span>
                    </span>
                );
            } else {
                components.push(
                    <span key={`empty-${i}`} style={{ color: "#CE9178" }}>""</span>
                );
            }
        }

        return (
            <span style={highlightStyle}>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {components}
                <span style={{ color: "#D4D4D4" }}>)</span>
            </span>
        );
    }

    private renderPythonCode(): React.ReactNode {
        const highlightStyle = this.inExecution
            ? { backgroundColor: "rgba(255, 200, 0, 0.15)" }
            : {};

        const separator = this.addSpaces ? " + ' ' + " : " + ";
        const components: React.ReactNode[] = [];

        for (let i = 0; i < this.componentCount; i++) {
            const slot = this.slots[`component${i}`];
            if (i > 0) {
                components.push(<span key={`sep-${i}`} style={{ color: "#D4D4D4" }}>{separator}</span>);
            }
            if (slot) {
                components.push(
                    <span key={`slot-${i}`}>
                        <span style={{ color: "#569CD6" }}>str</span>
                        <span style={{ color: "#D4D4D4" }}>(</span>
                        {slot.renderCode(CodeLanguages.PYTHON, "")}
                        <span style={{ color: "#D4D4D4" }}>)</span>
                    </span>
                );
            } else {
                components.push(
                    <span key={`empty-${i}`} style={{ color: "#CE9178" }}>""</span>
                );
            }
        }

        return (
            <span style={highlightStyle}>
                <span style={{ color: "#D4D4D4" }}>(</span>
                {components}
                <span style={{ color: "#D4D4D4" }}>)</span>
            </span>
        );
    }

    async *execute(): ExecutionGenerator {
        // Expression widgets don't yield steps - they're evaluated synchronously
    }

    async evaluate(): Promise<string> {
        const values: string[] = [];

        for (let i = 0; i < this.componentCount; i++) {
            const slot = this.slots[`component${i}`];
            if (slot) {
                const value = await slot.evaluate();
                values.push(String(value ?? ""));
            } else {
                values.push("");
            }
        }

        return this.addSpaces ? values.join(" ") : values.join("");
    }

    async openConfig(): Promise<boolean> {
        const minAllowedSlots = this.getHighestOccupiedSlotIndex() + 1;
        
        const result = await configModal.open({
            title: "Configure Text Builder",
            initialValues: { 
                componentCount: this.componentCount, 
                addSpaces: this.addSpaces,
                minAllowedSlots: Math.max(2, minAllowedSlots)
            },
            validate: createValidator(),
            renderContent: (props) => <TextBuilderConfigForm {...props} />,
        });

        if (result) {
            const newCount = result.componentCount as number;
            this.addSpaces = result.addSpaces as boolean;
            
            // Adjust slots if count changed
            if (newCount !== this.componentCount) {
                this.updateSlotCount(newCount);
            }
            return true;
        }
        return false;
    }

    private updateSlotCount(newCount: number) {
        // Clean up slots that will be removed
        for (let i = newCount; i < this.componentCount; i++) {
            const slotKey = `component${i}`;
            const widget = this.slots[slotKey];
            if (widget) {
                this.executor.deleteWidget(widget.id, true);
            }
            delete this.slots[slotKey];
        }

        // Add new empty slots if needed
        for (let i = this.componentCount; i < newCount; i++) {
            this.slots[`component${i}`] = null;
        }

        this.componentCount = newCount;
    }

    async initWidget(): Promise<void> {
        // Open config on creation
        await this.openConfig();
    }

    registerSlot(widget: GenericWidgetBase, slotId: string): void {
        this.slots[slotId] = widget;
    }

    unregisterSlot(slotId: string): void {
        this.slots[slotId] = null;
    }

    cleanup(): void {
        Object.values(this.slots).forEach(slot => {
            if (slot) {
                this.executor.deleteWidget(slot.id, true);
            }
        });
    }
}

