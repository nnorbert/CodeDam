import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Executor } from "../../Executor";
import { CreateVarWidget } from "../../widgets/variables/CreateVarWidget/CreateVarWidget";
import { SetVarWidget } from "../../widgets/variables/SetVarWidget/SetVarWidget";
import { UseVarWidget } from "../../widgets/variables/UseVarWidget/UseVarWidget";
import { IfWidget } from "../../widgets/decisions/IfWidget/IfWidget";
import { IfElseWidget } from "../../widgets/decisions/IfElseWidget/IfElseWidget";
import { WhileLoopWidget } from "../../widgets/loops/WhileLoop/WhileLoop";
import { RepeatNWidget } from "../../widgets/loops/RepeatN/RepeatN";
import { TextBuilderWidget } from "../../widgets/text/TextBuilderWidget/TextBuilderWidget";
import { UserInputWidget } from "../../widgets/interactions/UserInputWidget/UserInputWidget";
import { UsePrimitiveValueWidget } from "../../widgets/variables/UsePrimitiveValueWidget/UsePrimitiveValueWidget";
import { EqualWidget } from "../../widgets/conditions/EqualWidget/EqualWidget";
import { CANVAS_ID, CodeLanguages } from "../../../../utils/constants";
import { loadProject } from "../deserialize";
import { serializeProject } from "../serialize";
import type { SerializedWidget } from "../types";
import { validateProjectFile } from "../validate";
import invalidFormatFixture from "./fixtures/invalid-format.json";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { restoreProject } from "../../../../pages/playground/restoreProject";
import { ExecutionController } from "../../ExecutionController";

const __dirname = dirname(fileURLToPath(import.meta.url));

type WidgetClass = new (executor: Executor, options?: { id?: string }) => import("../../interfaces/IGenericWidget").IGenericWidget;

function linkSlot(
  executor: Executor,
  parentId: string,
  slotName: string,
  widgetClass: WidgetClass,
  id: string,
  config?: Record<string, unknown>
) {
  const parent = executor.getWidget(parentId);
  if (!parent) throw new Error(`Parent ${parentId} not found`);
  const child = executor.loadWidgetSilent(widgetClass, id, config);
  parent.registerSlot(child, slotName);
  executor.linkSlotWidget(child.id, parentId, slotName);
  return child;
}

function appendStatement(executor: Executor, widgetClass: WidgetClass, id: string, config?: Record<string, unknown>) {
  const widget = executor.loadWidgetSilent(widgetClass, id, config);
  executor.appendStatementWidget(widget);
  return widget;
}

function roundTrip(source: Executor) {
  const project = serializeProject(source, { codeLanguage: "javascript", name: "checklist" });
  const validation = validateProjectFile(project);
  expect(validation.ok).toBe(true);
  if (!validation.ok) throw new Error("validation failed");

  const target = new Executor(CANVAS_ID);
  const warnings = loadProject(target, validation.file);
  return { target, project, warnings };
}

function normalizeWidget(data: SerializedWidget): SerializedWidget {
  const normalized: SerializedWidget = { id: data.id, type: data.type };
  if (data.config && Object.keys(data.config).length > 0) normalized.config = data.config;
  if (data.slots) {
    normalized.slots = Object.fromEntries(
      Object.entries(data.slots)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, normalizeWidget(v)])
    );
  }
  if (data.bodies) {
    normalized.bodies = Object.fromEntries(
      Object.entries(data.bodies)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, v.map(normalizeWidget)])
    );
  }
  return normalized;
}

function normalizeStatements(source: Executor) {
  return serializeProject(source).runners[CANVAS_ID].statements.map(normalizeWidget);
}

function codePreviewMarkup(executor: Executor): string {
  const nodes = executor.getCodePreview(CodeLanguages.JAVASCRIPT);
  return renderToStaticMarkup(React.createElement(React.Fragment, null, ...nodes));
}

/** §11 manual checklist — restore & round-trip content (automated) */
describe("manual checklist — restore & round-trip", () => {
  it("CreateVar + primitive value round-trips name and value slot", () => {
    const source = new Executor(CANVAS_ID);
    appendStatement(source, CreateVarWidget, "var-1", { name: "score" });
    linkSlot(source, "var-1", "valueSlot", UsePrimitiveValueWidget, "prim-1", {
      activeTab: "number",
      numberValue: "99",
    });

    const { target } = roundTrip(source);
    const restored = target.getWidget("var-1") as CreateVarWidget;
    expect(restored.getName()).toBe("score");
    expect(restored.slots.valueSlot?.id).toBe("prim-1");
  });

  it("SetVar / UseVar keep variable references after load", () => {
    const source = new Executor(CANVAS_ID);
    appendStatement(source, CreateVarWidget, "var-a", { name: "a" });
    linkSlot(source, "var-a", "valueSlot", UsePrimitiveValueWidget, "prim-a", {
      activeTab: "number",
      numberValue: "1",
    });
    appendStatement(source, SetVarWidget, "set-a", { selectedVariableId: "var-a" });
    linkSlot(source, "set-a", "valueSlot", UseVarWidget, "use-in-set", { selectedVariableId: "var-a" });

    const { target } = roundTrip(source);
    const setVar = target.getWidget("set-a") as SetVarWidget;
    const useVar = target.getWidget("use-in-set") as UseVarWidget;
    expect(setVar.getReferencedVariableIds()).toContain("var-a");
    expect(useVar.getReferencedVariableIds()).toContain("var-a");
  });

  it("If / If-Else / While / Repeat-N restore nested bodies in correct branches", () => {
    const source = new Executor(CANVAS_ID);

    const ifWidget = appendStatement(source, IfWidget, "if-1") as IfWidget;
    linkSlot(source, "if-1", "conditionSlot", UsePrimitiveValueWidget, "if-cond", {
      activeTab: "boolean",
      booleanValue: "true",
    });
    appendStatement(ifWidget.thenExecutor, CreateVarWidget, "if-then-var", { name: "t" });

    const ifElse = appendStatement(source, IfElseWidget, "ifelse-1") as IfElseWidget;
    appendStatement(ifElse.thenExecutor, CreateVarWidget, "ie-then", { name: "thenVar" });
    appendStatement(ifElse.elseExecutor, CreateVarWidget, "ie-else", { name: "elseVar" });

    const whileLoop = appendStatement(source, WhileLoopWidget, "while-1") as WhileLoopWidget;
    appendStatement(whileLoop.bodyExecutor, CreateVarWidget, "while-body", { name: "w" });

    const repeatN = appendStatement(source, RepeatNWidget, "repeat-1") as RepeatNWidget;
    linkSlot(source, "repeat-1", "countSlot", UsePrimitiveValueWidget, "repeat-count", {
      activeTab: "number",
      numberValue: "3",
    });
    appendStatement(repeatN.bodyExecutor, CreateVarWidget, "repeat-body", { name: "r" });

    const { target } = roundTrip(source);
    expect(normalizeStatements(target)).toEqual(normalizeStatements(source));

    const restoredIfElse = target.getWidget("ifelse-1") as IfElseWidget;
    expect(restoredIfElse.thenExecutor.getWidgets()).toHaveLength(1);
    expect(restoredIfElse.elseExecutor.getWidgets()).toHaveLength(1);
    expect((restoredIfElse.thenExecutor.getWidgets()[0] as CreateVarWidget).getName()).toBe("thenVar");
    expect((restoredIfElse.elseExecutor.getWidgets()[0] as CreateVarWidget).getName()).toBe("elseVar");
  });

  it("TextBuilder with 3 components restores slot count and expressions", () => {
    const source = new Executor(CANVAS_ID);
    const createVar = appendStatement(source, CreateVarWidget, "var-tb", { name: "msg" });
    const textBuilder = linkSlot(source, createVar.id, "valueSlot", TextBuilderWidget, "tb-1", {
      componentCount: 3,
      addSpaces: true,
    });
    linkSlot(source, textBuilder.id, "component0", UsePrimitiveValueWidget, "tb-c0", {
      activeTab: "text",
      textValue: "Hello",
    });
    linkSlot(source, textBuilder.id, "component1", UsePrimitiveValueWidget, "tb-c1", {
      activeTab: "text",
      textValue: "World",
    });
    linkSlot(source, textBuilder.id, "component2", UsePrimitiveValueWidget, "tb-c2", {
      activeTab: "text",
      textValue: "!",
    });

    const { target } = roundTrip(source);
    const restored = target.getWidget("tb-1") as TextBuilderWidget;
    expect(restored.componentCount).toBe(3);
    expect(restored.addSpaces).toBe(true);
    expect(restored.slots.component0?.id).toBe("tb-c0");
    expect(restored.slots.component1?.id).toBe("tb-c1");
    expect(restored.slots.component2?.id).toBe("tb-c2");
  });

  it("UserInput settings (title, valueType) are restored", () => {
    const source = new Executor(CANVAS_ID);
    appendStatement(source, UserInputWidget, "input-1", {
      title: "Your age",
      valueType: "number",
    });

    const { target } = roundTrip(source);
    const restored = target.getWidget("input-1") as UserInputWidget;
    expect((restored as unknown as { title: string }).title).toBe("Your age");
    expect((restored as unknown as { valueType: string }).valueType).toBe("number");
  });

  it("load on non-empty canvas replaces all widgets (no merge)", () => {
    const existing = new Executor(CANVAS_ID);
    appendStatement(existing, CreateVarWidget, "old-1", { name: "old" });
    appendStatement(existing, CreateVarWidget, "old-2", { name: "old2" });
    expect(existing.getWidgets()).toHaveLength(2);

    const incoming = new Executor(CANVAS_ID);
    appendStatement(incoming, CreateVarWidget, "new-1", { name: "new" });
    const project = serializeProject(incoming);

    existing.clear();
    loadProject(existing, project);
    expect(existing.getWidgets()).toHaveLength(1);
    expect(existing.getWidgets()[0].id).toBe("new-1");
    expect(existing.getWidget("old-1")).toBeUndefined();
    expect(existing.getWidget("old-2")).toBeUndefined();
  });

  it("code preview matches after save/load round-trip", () => {
    const source = new Executor(CANVAS_ID);
    appendStatement(source, CreateVarWidget, "v1", { name: "x" });
    linkSlot(source, "v1", "valueSlot", UsePrimitiveValueWidget, "p1", {
      activeTab: "number",
      numberValue: "5",
    });
    const ifWidget = appendStatement(source, IfWidget, "if1") as IfWidget;
    const eq = linkSlot(source, "if1", "conditionSlot", EqualWidget, "eq1");
    linkSlot(source, eq.id, "leftOperand", UseVarWidget, "uv1", { selectedVariableId: "v1" });
    linkSlot(source, eq.id, "rightOperand", UsePrimitiveValueWidget, "p2", {
      activeTab: "number",
      numberValue: "5",
    });

    const before = codePreviewMarkup(source);
    const { target } = roundTrip(source);
    const after = codePreviewMarkup(target);
    expect(after).toBe(before);
  });

  it("restoreProject stops execution and clears executor widgets", () => {
    const mainExecutor = new Executor(CANVAS_ID);
    appendStatement(mainExecutor, CreateVarWidget, "v1", { name: "x" });

    const controller = new ExecutionController();
    controller.start(mainExecutor);
    expect(controller.getState()).not.toBe("idle");

    const emptyFile = {
      format: "codedam-project" as const,
      version: 1 as const,
      runners: {
        [CANVAS_ID]: { id: CANVAS_ID, kind: "main" as const, statements: [] },
      },
    };

    restoreProject({
      file: emptyFile,
      mainExecutor,
      executionController: controller,
      resetUiState: () => undefined,
      forceUpdate: () => undefined,
    });

    expect(controller.getState()).toBe("idle");
    expect(mainExecutor.getWidgets()).toHaveLength(0);
  });
});

describe("manual checklist — validation & file read", () => {
  it("rejects invalid format", () => {
    const result = validateProjectFile(invalidFormatFixture);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.includes("format"))).toBe(true);
  });

  it("rejects malformed JSON at parse time", () => {
    const invalidPath = join(__dirname, "fixtures/invalid-json.json");
    const text = readFileSync(invalidPath, "utf-8");
    expect(() => JSON.parse(text)).toThrow();
  });
});
