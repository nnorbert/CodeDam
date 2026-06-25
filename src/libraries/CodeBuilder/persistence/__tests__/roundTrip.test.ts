import { describe, expect, it } from "vitest";
import { Executor } from "../../Executor";
import { CreateVarWidget } from "../../widgets/variables/CreateVarWidget/CreateVarWidget";
import { IfWidget } from "../../widgets/decisions/IfWidget/IfWidget";
import { AdditionWidget } from "../../widgets/operations/AdditionWidget/AdditionWidget";
import { UsePrimitiveValueWidget } from "../../widgets/variables/UsePrimitiveValueWidget/UsePrimitiveValueWidget";
import { CANVAS_ID } from "../../../../utils/constants";
import { loadProject } from "../deserialize";
import { serializeProject, serializeWidget } from "../serialize";
import type { SerializedWidget } from "../types";
import { validateProjectFile } from "../validate";

function linkSlot(
  executor: Executor,
  parentId: string,
  slotName: string,
  widgetClass: new (executor: Executor, options?: { id?: string }) => unknown,
  id: string,
  config?: Record<string, unknown>
) {
  const parent = executor.getWidget(parentId);
  if (!parent) {
    throw new Error(`Parent widget ${parentId} not found`);
  }

  const child = executor.loadWidgetSilent(
    widgetClass as new (executor: Executor, options?: { id?: string }) => import("../../interfaces/IGenericWidget").IGenericWidget,
    id,
    config
  );
  parent.registerSlot(child, slotName);
  executor.linkSlotWidget(child.id, parentId, slotName);
  return child;
}

/** Build createVar + if(addition) representative project in memory. */
function buildSampleExecutor(): Executor {
  const executor = new Executor(CANVAS_ID);

  const createVar = executor.loadWidgetSilent(CreateVarWidget, "var-x", { name: "x" });
  executor.appendStatementWidget(createVar);
  linkSlot(executor, "var-x", "valueSlot", UsePrimitiveValueWidget, "prim-42", {
    activeTab: "number",
    numberValue: "42",
  });

  const ifWidget = executor.loadWidgetSilent(IfWidget, "if-1");
  executor.appendStatementWidget(ifWidget);

  const addition = linkSlot(executor, "if-1", "conditionSlot", AdditionWidget, "add-1");
  linkSlot(executor, addition.id, "leftOperand", UsePrimitiveValueWidget, "prim-left", {
    activeTab: "number",
    numberValue: "1",
  });
  linkSlot(executor, addition.id, "rightOperand", UsePrimitiveValueWidget, "prim-right", {
    activeTab: "number",
    numberValue: "2",
  });

  const nestedExecutor = (ifWidget as IfWidget).thenExecutor;
  const nestedVar = nestedExecutor.loadWidgetSilent(CreateVarWidget, "var-y", { name: "y" });
  nestedExecutor.appendStatementWidget(nestedVar);
  linkSlot(nestedExecutor, "var-y", "valueSlot", UsePrimitiveValueWidget, "prim-y", {
    activeTab: "number",
    numberValue: "0",
  });

  return executor;
}

function normalizeWidget(data: SerializedWidget): SerializedWidget {
  const normalized: SerializedWidget = {
    id: data.id,
    type: data.type,
  };

  if (data.config && Object.keys(data.config).length > 0) {
    normalized.config = data.config;
  }

  if (data.slots) {
    const slots: Record<string, SerializedWidget> = {};
    for (const [name, slot] of Object.entries(data.slots).sort(([a], [b]) => a.localeCompare(b))) {
      slots[name] = normalizeWidget(slot);
    }
    normalized.slots = slots;
  }

  if (data.bodies) {
    const bodies: Record<string, SerializedWidget[]> = {};
    for (const [name, statements] of Object.entries(data.bodies).sort(([a], [b]) => a.localeCompare(b))) {
      bodies[name] = statements.map(normalizeWidget);
    }
    normalized.bodies = bodies;
  }

  return normalized;
}

function normalizeProject(project: ReturnType<typeof serializeProject>) {
  const canvas = project.runners[CANVAS_ID];
  return {
    format: project.format,
    version: project.version,
    statements: canvas.statements.map(normalizeWidget),
  };
}

describe("persistence round-trip", () => {
  it("serializeProject → loadProject preserves widget structure", () => {
    const source = buildSampleExecutor();
    const project = serializeProject(source, { codeLanguage: "javascript", name: "Round-trip test" });

    const validation = validateProjectFile(project);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const target = new Executor(CANVAS_ID);
    const warnings = loadProject(target, validation.file);
    expect(warnings).toEqual([]);

    expect(target.getWidgets()).toHaveLength(2);
    expect(target.getWidgets().map((w) => w.id)).toEqual(["var-x", "if-1"]);

    const roundTripped = serializeProject(target);
    expect(normalizeProject(roundTripped)).toEqual(normalizeProject(project));
  });

  it("serializeWidget captures nested if body statements", () => {
    const executor = buildSampleExecutor();
    const ifWidget = executor.getWidget("if-1");
    expect(ifWidget).toBeDefined();

    const serialized = serializeWidget(ifWidget!);
    expect(serialized.type).toBe("if");
    expect(serialized.bodies?.then).toHaveLength(1);
    expect(serialized.bodies?.then[0].type).toBe("createVar");
    expect(serialized.slots?.conditionSlot.type).toBe("addition");
  });

  it("loads empty canvas from project with no canvas runner", () => {
    const file = {
      format: "codedam-project" as const,
      version: 1 as const,
      runners: {},
    };

    const validation = validateProjectFile(file);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const executor = new Executor(CANVAS_ID);
    const orphan = executor.loadWidgetSilent(CreateVarWidget, "orphan", { name: "z" });
    executor.appendStatementWidget(orphan);
    expect(executor.getWidgets()).toHaveLength(1);

    executor.clear();
    const warnings = loadProject(executor, validation.file);
    expect(warnings.some((w) => w.includes(CANVAS_ID))).toBe(true);
    expect(executor.getWidgets()).toHaveLength(0);
  });

  it("skips unknown widget types and collects warnings", () => {
    const file = {
      format: "codedam-project" as const,
      version: 1 as const,
      runners: {
        [CANVAS_ID]: {
          id: CANVAS_ID,
          kind: "main" as const,
          statements: [
            { id: "known", type: "createVar", config: { name: "a" } },
            { id: "unknown", type: "future-widget" },
          ],
        },
      },
    };

    const executor = new Executor(CANVAS_ID);
    const warnings = loadProject(executor, file);
    expect(warnings).toContain('Unknown widget type: "future-widget" (id: unknown)');
    expect(executor.getWidgets()).toHaveLength(1);
    expect(executor.getWidgets()[0].id).toBe("known");
  });
});
