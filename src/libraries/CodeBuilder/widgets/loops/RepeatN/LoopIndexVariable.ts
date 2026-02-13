import { WidgetCategory, WidgetRoles, type CodeLanguageType, type WidgetCategoryType, type WidgetRoleType } from "../../../../../utils/constants";
import { GenericWidgetBase } from "../../../baseClasses/GenericWidgetBase";
import type { Executor } from "../../../Executor";
import type { ExecutionGenerator } from "../../../ExecutionTypes";
import type { IVariable } from "../../../interfaces/IVariable";

/**
 * Synthetic variable representing the loop index in a Repeat N (for) loop.
 * Declared in the body executor's scope so body widgets can reference "index" via Use Variable.
 * Value is controlled by RepeatNWidget each iteration.
 */
export class LoopIndexVariable extends GenericWidgetBase implements IVariable {

    public static getType(): string {
        return "loop-index";
    }

    public static getCategory(): WidgetCategoryType {
        return WidgetCategory.LOOPS;
    }

    public static getToolboxItemElement(): React.ReactNode {
        return null;
    }

    public static getRole(): WidgetRoleType {
        return WidgetRoles.EXPRESSION;
    }

    public isConstant: boolean = false;
    private currentValue: number = 0;

    constructor(executor: Executor) {
        super(executor);
    }

    getName(): string {
        return "index";
    }

    getValue(): unknown {
        return this.currentValue;
    }

    setValue(value: unknown): void {
        this.currentValue = Number(value) ?? 0;
        this.executor.setExecutionVariable("index", this.currentValue);
    }

    render(): React.ReactNode {
        return null;
    }

    renderCode(_language: CodeLanguageType, _indent: string = ""): React.ReactNode[] {
        return [];
    }

    async *execute(): ExecutionGenerator {
        // No-op; value is set by RepeatNWidget each iteration
    }

    async initWidget(): Promise<void> {
        // Nothing to do
    }

    cleanup(): void {
        // Nothing to do
    }
}
