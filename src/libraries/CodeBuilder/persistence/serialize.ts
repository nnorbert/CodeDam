import type { Executor } from "../Executor";
import type { GenericWidgetBase } from "../baseClasses/GenericWidgetBase";
import type { IGenericWidget } from "../interfaces/IGenericWidget";
import { IfWidget } from "../widgets/decisions/IfWidget/IfWidget";
import { IfElseWidget } from "../widgets/decisions/IfElseWidget/IfElseWidget";
import { WhileLoopWidget } from "../widgets/loops/WhileLoop/WhileLoop";
import { RepeatNWidget } from "../widgets/loops/RepeatN/RepeatN";
import { CANVAS_ID } from "../../../utils/constants";
import {
  CURRENT_VERSION,
  PROJECT_FORMAT,
  type CodeDamProjectFile,
  type CodeLanguagePreference,
  type SerializedWidget,
} from "./types";
import { serializeWidgetConfig } from "./widgetConfig";

type SlottedWidget = IGenericWidget & {
  slots: Record<string, GenericWidgetBase | null>;
};

function hasSlots(widget: IGenericWidget): widget is SlottedWidget {
  return "slots" in widget && typeof (widget as SlottedWidget).slots === "object";
}

function getWidgetType(widget: IGenericWidget): string {
  return (widget.constructor as typeof GenericWidgetBase).getType();
}

function serializeSlots(widget: IGenericWidget): Record<string, SerializedWidget> | undefined {
  if (!hasSlots(widget)) {
    return undefined;
  }

  const slots: Record<string, SerializedWidget> = {};
  for (const [slotName, slotWidget] of Object.entries(widget.slots)) {
    if (slotWidget) {
      slots[slotName] = serializeWidget(slotWidget);
    }
  }

  return Object.keys(slots).length > 0 ? slots : undefined;
}

function serializeBodies(widget: IGenericWidget): Record<string, SerializedWidget[]> | undefined {
  const type = getWidgetType(widget);
  const bodies: Record<string, SerializedWidget[]> = {};

  switch (type) {
    case "if": {
      const statements = serializeExecutor((widget as IfWidget).thenExecutor);
      if (statements.length > 0) {
        bodies.then = statements;
      }
      break;
    }
    case "if-else": {
      const ifElseWidget = widget as IfElseWidget;
      const thenStatements = serializeExecutor(ifElseWidget.thenExecutor);
      const elseStatements = serializeExecutor(ifElseWidget.elseExecutor);
      if (thenStatements.length > 0) {
        bodies.then = thenStatements;
      }
      if (elseStatements.length > 0) {
        bodies.else = elseStatements;
      }
      break;
    }
    case "while-loop": {
      const statements = serializeExecutor((widget as WhileLoopWidget).bodyExecutor);
      if (statements.length > 0) {
        bodies.body = statements;
      }
      break;
    }
    case "repeat-n": {
      const statements = serializeExecutor((widget as RepeatNWidget).bodyExecutor);
      if (statements.length > 0) {
        bodies.body = statements;
      }
      break;
    }
    default:
      return undefined;
  }

  return Object.keys(bodies).length > 0 ? bodies : undefined;
}

export function serializeWidget(widget: IGenericWidget): SerializedWidget {
  const serialized: SerializedWidget = {
    id: widget.id,
    type: getWidgetType(widget),
  };

  const config = serializeWidgetConfig(widget);
  if (config && Object.keys(config).length > 0) {
    serialized.config = config;
  }

  const slots = serializeSlots(widget);
  if (slots) {
    serialized.slots = slots;
  }

  const bodies = serializeBodies(widget);
  if (bodies) {
    serialized.bodies = bodies;
  }

  return serialized;
}

export function serializeExecutor(executor: Executor): SerializedWidget[] {
  return executor.getWidgets().map((widget) => serializeWidget(widget));
}

export function serializeProject(
  mainExecutor: Executor,
  options?: { codeLanguage?: CodeLanguagePreference; name?: string }
): CodeDamProjectFile {
  const now = new Date().toISOString();

  return {
    format: PROJECT_FORMAT,
    version: CURRENT_VERSION,
    metadata: {
      ...(options?.name ? { name: options.name } : {}),
      updatedAt: now,
    },
    ...(options?.codeLanguage ? { preferences: { codeLanguage: options.codeLanguage } } : {}),
    runners: {
      [CANVAS_ID]: {
        id: CANVAS_ID,
        kind: "main",
        label: "Main",
        statements: serializeExecutor(mainExecutor),
      },
    },
  };
}
