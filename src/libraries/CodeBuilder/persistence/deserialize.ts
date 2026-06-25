import type { Executor } from "../Executor";
import type { GenericWidgetBase } from "../baseClasses/GenericWidgetBase";
import type { IGenericWidget } from "../interfaces/IGenericWidget";
import { IfWidget } from "../widgets/decisions/IfWidget/IfWidget";
import { IfElseWidget } from "../widgets/decisions/IfElseWidget/IfElseWidget";
import { WhileLoopWidget } from "../widgets/loops/WhileLoop/WhileLoop";
import { RepeatNWidget } from "../widgets/loops/RepeatN/RepeatN";
import { getWidgetClass, type WidgetClass } from "../widgetRegistry";
import { CANVAS_ID, CodeLanguages, type CodeLanguageType } from "../../../utils/constants";
import type { CodeDamProjectFile, SerializedRunner, SerializedWidget } from "./types";

export interface DeserializeOptions {
  warnings: string[];
}

interface SlotContext {
  parentWidgetId: string;
  slotName: string;
}

function getWidgetType(widget: IGenericWidget): string {
  return (widget.constructor as typeof GenericWidgetBase).getType();
}

function getNestedExecutorForBody(widget: IGenericWidget, bodyName: string): Executor | undefined {
  const type = getWidgetType(widget);

  switch (type) {
    case "if":
      return bodyName === "then" ? (widget as IfWidget).thenExecutor : undefined;
    case "if-else":
      if (bodyName === "then") return (widget as IfElseWidget).thenExecutor;
      if (bodyName === "else") return (widget as IfElseWidget).elseExecutor;
      return undefined;
    case "while-loop":
      return bodyName === "body" ? (widget as WhileLoopWidget).bodyExecutor : undefined;
    case "repeat-n":
      return bodyName === "body" ? (widget as RepeatNWidget).bodyExecutor : undefined;
    default:
      return undefined;
  }
}

function deserializeBodies(
  widget: IGenericWidget,
  bodies: Record<string, SerializedWidget[]>,
  options: DeserializeOptions
): void {
  for (const [bodyName, statements] of Object.entries(bodies)) {
    const nestedExecutor = getNestedExecutorForBody(widget, bodyName);
    if (!nestedExecutor) {
      options.warnings.push(
        `Unknown body "${bodyName}" for widget type "${getWidgetType(widget)}" (id: ${widget.id})`
      );
      continue;
    }

    deserializeRunner(nestedExecutor, { id: nestedExecutor.getContainerId(), kind: "main", statements }, options);
  }
}

export function deserializeWidget(
  executor: Executor,
  data: SerializedWidget,
  options: DeserializeOptions,
  slotContext?: SlotContext
): IGenericWidget | null {
  const WidgetClass = getWidgetClass(data.type) as WidgetClass | undefined;
  if (!WidgetClass) {
    options.warnings.push(`Unknown widget type: "${data.type}" (id: ${data.id})`);
    return null;
  }

  let widget: IGenericWidget;
  try {
    widget = executor.loadWidgetSilent(
      WidgetClass as unknown as new (executor: Executor, options?: { id?: string }) => IGenericWidget,
      data.id,
      data.config
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    options.warnings.push(`Failed to create widget "${data.type}" (id: ${data.id}): ${message}`);
    return null;
  }

  if (slotContext) {
    const parent = executor.getWidget(slotContext.parentWidgetId);
    if (parent) {
      parent.registerSlot(widget, slotContext.slotName);
      executor.linkSlotWidget(widget.id, slotContext.parentWidgetId, slotContext.slotName);
    } else {
      options.warnings.push(
        `Parent widget "${slotContext.parentWidgetId}" not found for slot "${slotContext.slotName}"`
      );
    }
  }

  if (data.slots) {
    for (const [slotName, slotData] of Object.entries(data.slots)) {
      try {
        deserializeWidget(executor, slotData, options, {
          parentWidgetId: widget.id,
          slotName,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        options.warnings.push(
          `Failed to deserialize slot "${slotName}" on widget ${widget.id}: ${message}`
        );
      }
    }
  }

  if (data.bodies) {
    try {
      deserializeBodies(widget, data.bodies, options);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      options.warnings.push(`Failed to deserialize bodies on widget ${widget.id}: ${message}`);
    }
  }

  return widget;
}

export function deserializeRunner(
  executor: Executor,
  runner: SerializedRunner,
  options: DeserializeOptions
): void {
  const statements = runner.statements ?? [];
  for (const statementData of statements) {
    try {
      const widget = deserializeWidget(executor, statementData, options);
      if (widget) {
        executor.appendStatementWidget(widget);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      options.warnings.push(
        `Failed to deserialize widget "${statementData.type}" (id: ${statementData.id}): ${message}`
      );
    }
  }
}

export function loadProject(
  mainExecutor: Executor,
  file: CodeDamProjectFile,
  options?: DeserializeOptions
): string[] {
  const warnings = options?.warnings ?? [];
  const deserializeOptions: DeserializeOptions = { warnings };

  const canvasRunner = file.runners[CANVAS_ID];
  if (!canvasRunner) {
    warnings.push(`Missing runner "${CANVAS_ID}"`);
    return warnings;
  }

  deserializeRunner(mainExecutor, canvasRunner, deserializeOptions);
  return warnings;
}

export function getCodeLanguageFromProject(file: CodeDamProjectFile): CodeLanguageType | undefined {
  const lang = file.preferences?.codeLanguage;
  if (lang === CodeLanguages.JAVASCRIPT || lang === CodeLanguages.PYTHON) {
    return lang;
  }
  return undefined;
}
