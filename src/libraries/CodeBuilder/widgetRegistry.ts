import type { GenericWidgetBase } from "./baseClasses/GenericWidgetBase";
import { CreateVarWidget } from "./widgets/variables/CreateVarWidget/CreateVarWidget";
import { CreateConstWidget } from "./widgets/variables/CreateConstWidget/CreateConstWidget";
import { SetVarWidget } from "./widgets/variables/SetVarWidget/SetVarWidget";
import { UsePrimitiveValueWidget } from "./widgets/variables/UsePrimitiveValueWidget/UsePrimitiveValueWidget";
import { UseVarWidget } from "./widgets/variables/UseVarWidget/UseVarWidget";
import { IfWidget } from "./widgets/decisions/IfWidget/IfWidget";
import { IfElseWidget } from "./widgets/decisions/IfElseWidget/IfElseWidget";
import { WhileLoopWidget } from "./widgets/loops/WhileLoop/WhileLoop";
import { RepeatNWidget } from "./widgets/loops/RepeatN/RepeatN";
import { AdditionWidget } from "./widgets/operations/AdditionWidget/AdditionWidget";
import { SubtractionWidget } from "./widgets/operations/SubtractionWidget/SubtractionWidget";
import { MultiplicationWidget } from "./widgets/operations/MultiplicationWidget/MultiplicationWidget";
import { DivisionWidget } from "./widgets/operations/DivisionWidget/DivisionWidget";
import { ModuloWidget } from "./widgets/operations/ModuloWidget/ModuloWidget";
import { TextBuilderWidget } from "./widgets/text/TextBuilderWidget/TextBuilderWidget";
import { TextLengthWidget } from "./widgets/text/TextLengthWidget/TextLengthWidget";
import { NegationWidget } from "./widgets/conditions/NegationWidget/NegationWidget";
import { GreaterThanWidget } from "./widgets/conditions/GreaterThanWidget/GreaterThanWidget";
import { GreaterOrEqualWidget } from "./widgets/conditions/GreaterOrEqualWidget/GreaterOrEqualWidget";
import { LessThanWidget } from "./widgets/conditions/LessThanWidget/LessThanWidget";
import { LessOrEqualWidget } from "./widgets/conditions/LessOrEqualWidget/LessOrEqualWidget";
import { EqualWidget } from "./widgets/conditions/EqualWidget/EqualWidget";
import { StrictEqualWidget } from "./widgets/conditions/StrictEqualWidget/StrictEqualWidget";
import { AndWidget } from "./widgets/conditions/AndWidget/AndWidget";
import { OrWidget } from "./widgets/conditions/OrWidget/OrWidget";
import { UserInputWidget } from "./widgets/interactions/UserInputWidget/UserInputWidget";
import { UserOutputWidget } from "./widgets/interactions/UserOutputWidget/UserOutputWidget";

export type WidgetClass = typeof GenericWidgetBase;

const WIDGET_CLASSES: WidgetClass[] = [
  CreateVarWidget,
  CreateConstWidget,
  SetVarWidget,
  UsePrimitiveValueWidget,
  UseVarWidget,
  IfWidget,
  IfElseWidget,
  WhileLoopWidget,
  RepeatNWidget,
  AdditionWidget,
  SubtractionWidget,
  MultiplicationWidget,
  DivisionWidget,
  ModuloWidget,
  TextBuilderWidget,
  TextLengthWidget,
  NegationWidget,
  GreaterThanWidget,
  GreaterOrEqualWidget,
  LessThanWidget,
  LessOrEqualWidget,
  EqualWidget,
  StrictEqualWidget,
  AndWidget,
  OrWidget,
  UserInputWidget,
  UserOutputWidget,
];

/** Map of widget type string → constructor. Excludes internal-only types (e.g. loop-index). */
export const WIDGET_REGISTRY: Record<string, WidgetClass> = Object.fromEntries(
  WIDGET_CLASSES.map((WidgetClassConstructor) => [
    (WidgetClassConstructor as WidgetClass).getType(),
    WidgetClassConstructor as WidgetClass,
  ])
);

export function getWidgetClass(type: string): WidgetClass | undefined {
  return WIDGET_REGISTRY[type];
}

export function getAllWidgetClasses(): WidgetClass[] {
  return [...WIDGET_CLASSES];
}
