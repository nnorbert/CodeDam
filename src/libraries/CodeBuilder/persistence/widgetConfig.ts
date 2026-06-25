import type { GenericWidgetBase } from "../baseClasses/GenericWidgetBase";
import { CreateVarWidget } from "../widgets/variables/CreateVarWidget/CreateVarWidget";
import { CreateConstWidget } from "../widgets/variables/CreateConstWidget/CreateConstWidget";
import { SetVarWidget } from "../widgets/variables/SetVarWidget/SetVarWidget";
import { UseVarWidget } from "../widgets/variables/UseVarWidget/UseVarWidget";
import { UsePrimitiveValueWidget } from "../widgets/variables/UsePrimitiveValueWidget/UsePrimitiveValueWidget";
import { TextBuilderWidget } from "../widgets/text/TextBuilderWidget/TextBuilderWidget";
import { UserInputWidget } from "../widgets/interactions/UserInputWidget/UserInputWidget";
import {
  getConfigFromValue,
  getValueFromConfig,
  type UsePrimitiveValueConfig,
} from "../widgets/variables/UsePrimitiveValueWidget/UsePrimitiveValueConfigForm";
import type { UserInputValueType } from "../widgets/interactions/UserInputWidget/UserInputConfigForm";
import type { IGenericWidget } from "../interfaces/IGenericWidget";
import type { IVariable } from "../interfaces/IVariable";

type ConfigRecord = Record<string, unknown>;

function getWidgetType(widget: IGenericWidget): string {
  return (widget.constructor as typeof GenericWidgetBase).getType();
}

export function serializeCreateVarConfig(widget: CreateVarWidget): ConfigRecord {
  return { name: widget.getName() };
}

export function applyCreateVarConfig(widget: CreateVarWidget, config: ConfigRecord): boolean {
  if (typeof config.name !== "string") {
    return false;
  }
  (widget as unknown as { name: string }).name = config.name.trim();
  return true;
}

export function serializeCreateConstConfig(widget: CreateConstWidget): ConfigRecord {
  return { name: widget.getName() };
}

export function applyCreateConstConfig(widget: CreateConstWidget, config: ConfigRecord): boolean {
  if (typeof config.name !== "string") {
    return false;
  }
  (widget as unknown as { name: string }).name = config.name.trim();
  return true;
}

export function serializeSetVarConfig(widget: SetVarWidget): ConfigRecord {
  const ids = widget.getReferencedVariableIds();
  return { selectedVariableId: ids[0] ?? "" };
}

export function applySetVarConfig(widget: SetVarWidget, config: ConfigRecord): boolean {
  if (typeof config.selectedVariableId !== "string") {
    return false;
  }
  const variableStack = widget.executor.getVariableStack();
  const target = variableStack[config.selectedVariableId] ?? null;
  (widget as unknown as { targetVariable: (IGenericWidget & IVariable) | null }).targetVariable = target;
  return true;
}

export function serializeUseVarConfig(widget: UseVarWidget): ConfigRecord {
  const ids = widget.getReferencedVariableIds();
  return { selectedVariableId: ids[0] ?? "" };
}

export function applyUseVarConfig(widget: UseVarWidget, config: ConfigRecord): boolean {
  if (typeof config.selectedVariableId !== "string") {
    return false;
  }
  const variableStack = widget.executor.getVariableStack();
  const provider = variableStack[config.selectedVariableId] ?? null;
  (widget as unknown as { valueProvider: (IGenericWidget & IVariable) | null }).valueProvider = provider;
  return true;
}

export function serializeUsePrimitiveValueConfig(widget: UsePrimitiveValueWidget): ConfigRecord {
  return getConfigFromValue(widget.getValue(), true);
}

export function applyUsePrimitiveValueConfig(
  widget: UsePrimitiveValueWidget,
  config: ConfigRecord
): boolean {
  const primitiveConfig = config as UsePrimitiveValueConfig;
  if (typeof primitiveConfig.activeTab !== "string") {
    return false;
  }
  (widget as unknown as { value: string | number | boolean | null | undefined }).value =
    getValueFromConfig(primitiveConfig);
  return true;
}

export function serializeTextBuilderConfig(widget: TextBuilderWidget): ConfigRecord {
  return {
    componentCount: widget.componentCount,
    addSpaces: widget.addSpaces,
  };
}

export function applyTextBuilderConfig(widget: TextBuilderWidget, config: ConfigRecord): boolean {
  if (typeof config.componentCount !== "number" || typeof config.addSpaces !== "boolean") {
    return false;
  }

  const count = Math.max(2, Math.floor(config.componentCount));
  widget.addSpaces = config.addSpaces;

  const newSlots: Record<string, GenericWidgetBase | null> = {};
  for (let i = 0; i < count; i++) {
    const slotKey = `component${i}`;
    newSlots[slotKey] = widget.slots[slotKey] ?? null;
  }
  widget.slots = newSlots;
  widget.componentCount = count;
  return true;
}

export function serializeUserInputConfig(widget: UserInputWidget): ConfigRecord {
  return {
    title: widget.getTitle(),
    valueType: widget.getValueType(),
  };
}

export function applyUserInputConfig(widget: UserInputWidget, config: ConfigRecord): boolean {
  if (typeof config.title !== "string") {
    return false;
  }
  const valueType = config.valueType;
  if (valueType !== "text" && valueType !== "number") {
    return false;
  }
  (widget as unknown as { title: string }).title = config.title;
  (widget as unknown as { valueType: UserInputValueType }).valueType = valueType;
  return true;
}

/** Serialize widget-specific config; returns undefined when the widget has no config. */
export function serializeWidgetConfig(widget: IGenericWidget): ConfigRecord | undefined {
  switch (getWidgetType(widget)) {
    case "createVar":
      return serializeCreateVarConfig(widget as CreateVarWidget);
    case "createConst":
      return serializeCreateConstConfig(widget as CreateConstWidget);
    case "setVar":
      return serializeSetVarConfig(widget as SetVarWidget);
    case "useVar":
      return serializeUseVarConfig(widget as UseVarWidget);
    case "usePrimitiveValue":
      return serializeUsePrimitiveValueConfig(widget as UsePrimitiveValueWidget);
    case "textBuilder":
      return serializeTextBuilderConfig(widget as TextBuilderWidget);
    case "userInput":
      return serializeUserInputConfig(widget as UserInputWidget);
    default:
      return undefined;
  }
}

/** Apply widget-specific config without opening modals. Returns false if config is invalid. */
export function applyWidgetConfig(widget: IGenericWidget, config: ConfigRecord): boolean {
  switch (getWidgetType(widget)) {
    case "createVar":
      return applyCreateVarConfig(widget as CreateVarWidget, config);
    case "createConst":
      return applyCreateConstConfig(widget as CreateConstWidget, config);
    case "setVar":
      return applySetVarConfig(widget as SetVarWidget, config);
    case "useVar":
      return applyUseVarConfig(widget as UseVarWidget, config);
    case "usePrimitiveValue":
      return applyUsePrimitiveValueConfig(widget as UsePrimitiveValueWidget, config);
    case "textBuilder":
      return applyTextBuilderConfig(widget as TextBuilderWidget, config);
    case "userInput":
      return applyUserInputConfig(widget as UserInputWidget, config);
    default:
      return true;
  }
}
