# Save & Load Implementation Plan

This document analyses how to add project save/load to CodeDam: serializing the widget tree (statements, slots, settings) to a file, downloading it to the user's computer, and restoring a saved project from that file. It includes a **full UI specification** (Save/Load buttons and modals — see §6) and a **mandatory full state reset** on load (see §5.1). It is written as a sequence of small tasks that an AI agent (or developer) can execute one at a time.

---

## 1. Current Architecture Summary

### 1.1 What holds the program state?

CodeDam does **not** use Redux, Zustand, or similar. The editable program lives in **`Executor` class instances** held in React refs on the playground page.

| Layer | Location | What it stores |
|-------|----------|----------------|
| Root program | `mainExecutorRef` in `src/pages/playground/Page.tsx` | Top-level statement widgets (`widgets[]`) |
| All widgets | `Executor.widgetMap` | Every widget in this executor subtree (statements + slot expressions) |
| Variables | `Executor.variableStack` | `CreateVar` / `CreateConst` widgets keyed by widget ID |
| Slot ownership | `Executor.slotMap` | Reverse lookup: slot widget ID → parent widget + slot name |
| Nested blocks | Child `Executor` on block widgets | `IfWidget.thenExecutor`, `IfElseWidget.thenExecutor` / `elseExecutor`, `WhileLoopWidget.bodyExecutor`, `RepeatNWidget.bodyExecutor` |

Runtime execution state (`executionVariables`, `inExecution`, `activeLineKeys`) is **ephemeral** and must **not** be saved.

### 1.2 Widget model

- Widgets are **TypeScript classes** extending `GenericWidgetBase` (`src/libraries/CodeBuilder/baseClasses/GenericWidgetBase.ts`).
- Each widget gets a unique **`nanoid()` ID** in the constructor.
- Widget type is identified by the static method **`getType()`** (e.g. `"createVar"`, `"if"`, `"addition"`).
- Widgets are created via `Executor.createWidget(WidgetClass)` or `Executor.registerWidget` / `registerSlot` (which also call `initWidget()` and may open config modals).

### 1.3 What must be serialized?

For each widget in the tree:

| Data | Source | Notes |
|------|--------|-------|
| `id` | `widget.id` | **Must be preserved** — `SetVar` / `UseVar` reference variables by widget ID |
| `type` | `WidgetClass.getType()` | Stable string key for deserialization |
| `config` | Widget-specific private/public fields | Only for widgets with settings (see §3.2) |
| `slots` | `widget.slots` | Map of slot name → nested expression widget (recursive) |
| `bodies` | Nested `Executor.getWidgets()` | Named child canvases on block widgets (see §2.2) |

**Do not serialize:**

- `LoopIndexVariable` (`type: "loop-index"`) — created automatically by `RepeatNWidget` in its constructor
- Runtime fields: `inExecution`, `activeLineKeys`, execution stack, variable *values* at runtime
- React/DnD UI state: `activeOverId`, drag overlay, etc.

### 1.4 Existing gaps (no save/load today)

- No serialization API on `Executor` or widgets
- No central **widget type registry** (constructors are listed inline in `Page.tsx` `activeWidgets`)
- `GenericWidgetBase` always assigns a new `nanoid()` — loading must be able to **restore a specific ID**
- `initWidget()` opens config modals on create — load path must **apply config silently** without modals
- No `Executor.clear()` to wipe the canvas before loading

---

## 2. Recommended File Format

### 2.1 Why JSON?

Use **JSON** with a versioned schema:

- Native `JSON.stringify` / `JSON.parse` in the browser
- Human-readable for debugging and manual edits
- Easy to validate and migrate across app versions
- Sufficient size for typical programs; compression can be added later if needed

Suggested file extension: **`.codedam.json`** (or `.codedam` with `application/json` MIME type).

### 2.2 Multi-runner data structure (future-proof)

Today there is one main droppable canvas (`CANVAS_ID = "canvas"` in `src/utils/constants.ts`). Future “functions” will likely be additional droppable areas, each backed by its own `Executor`.

Design the root document around a **`runners`** map rather than a single root tree:

```typescript
/** Top-level project file */
interface CodeDamProjectFile {
  format: "codedam-project";
  version: 1;
  metadata?: {
    name?: string;
    createdAt?: string;   // ISO 8601
    updatedAt?: string;
    appVersion?: string;  // from package.json
  };
  /** Optional editor preferences (not required for execution) */
  preferences?: {
    codeLanguage?: "javascript" | "python";
  };
  /**
   * One entry per droppable runner (canvas / future function body).
   * Keys are stable runner IDs (e.g. "canvas", "function-greet").
   */
  runners: Record<string, SerializedRunner>;
}

interface SerializedRunner {
  /** Same as the key in `runners`; redundant but useful when embedding */
  id: string;
  /** Distinguishes main program from future function runners */
  kind: "main" | "function";
  /** Human label, e.g. "Main", "function greet" */
  label?: string;
  /** Ordered top-level statements on this runner's canvas */
  statements: SerializedWidget[];
}

interface SerializedWidget {
  id: string;
  type: string;
  /** Widget-specific settings; omitted when empty */
  config?: Record<string, unknown>;
  /** Expression slots: slot name → widget or omitted when empty */
  slots?: Record<string, SerializedWidget>;
  /**
   * Nested statement lists inside block widgets.
   * Keys are stable body names, not canvas DOM ids:
   *   - if:           { "then": [...] }
   *   - if-else:      { "then": [...], "else": [...] }
   *   - while-loop:   { "body": [...] }
   *   - repeat-n:     { "body": [...] }
   */
  bodies?: Record<string, SerializedWidget[]>;
}
```

**Phase 1 (current scope):** only populate `runners.canvas` with `kind: "main"`. Leave the `runners` map structure in place so adding `runners["function-foo"]` later does not require a breaking format change.

### 2.3 Example (minimal project)

```json
{
  "format": "codedam-project",
  "version": 1,
  "metadata": {
    "name": "My first program",
    "createdAt": "2026-06-25T12:00:00.000Z"
  },
  "preferences": {
    "codeLanguage": "javascript"
  },
  "runners": {
    "canvas": {
      "id": "canvas",
      "kind": "main",
      "label": "Main",
      "statements": [
        {
          "id": "abc123",
          "type": "createVar",
          "config": { "name": "x" },
          "slots": {
            "valueSlot": {
              "id": "def456",
              "type": "usePrimitiveValue",
              "config": {
                "activeTab": "number",
                "numberValue": "42"
              }
            }
          }
        }
      ]
    }
  }
}
```

### 2.4 Versioning and validation

- Reject files where `format !== "codedam-project"` or `version` is unsupported.
- Plan for `version: 2` migrations in a dedicated `migrateProjectFile()` function when the schema changes.
- On load, collect unknown `type` strings and report them without crashing the whole app.

---

## 3. Per-Widget Serialization Reference

### 3.1 Widget type registry

Extract the `activeWidgets` array from `src/pages/playground/Page.tsx` into a shared module, e.g.:

`src/libraries/CodeBuilder/widgetRegistry.ts`

```typescript
export const WIDGET_REGISTRY: Record<string, WidgetClass> = { ... };
export function getWidgetClass(type: string): WidgetClass | undefined;
export function getAllWidgetClasses(): WidgetClass[];
```

Map each `getType()` return value to its constructor. Exclude `LoopIndexVariable` from the registry (internal only).

### 3.2 Config fields per widget type

| `type` | `config` fields | `slots` | `bodies` |
|--------|-----------------|---------|----------|
| `createVar` | `{ name: string }` | `valueSlot` | — |
| `createConst` | `{ name: string }` | `valueSlot` | — |
| `setVar` | `{ selectedVariableId: string }` | `valueSlot` | — |
| `useVar` | `{ selectedVariableId: string }` | — | — |
| `usePrimitiveValue` | Use `UsePrimitiveValueConfig` shape from `UsePrimitiveValueConfigForm.tsx` (use existing `getConfigFromValue` / `getValueFromConfig` helpers) | — | — |
| `textBuilder` | `{ componentCount: number, addSpaces: boolean }` | `component0` … `component{N-1}` | — |
| `userInput` | `{ title: string, valueType: "text" \| "number" }` | — | — |
| `userOutput` | — | `valueSlot` | — |
| `if` | — | `conditionSlot` | `{ then: [...] }` |
| `if-else` | — | `conditionSlot` | `{ then: [...], else: [...] }` |
| `while-loop` | — | `conditionSlot` | `{ body: [...] }` |
| `repeat-n` | — | `countSlot` | `{ body: [...] }` |
| Binary ops (`addition`, `subtraction`, …) | — | `leftOperand`, `rightOperand` | — |
| Unary ops (`negation`, `textLength`) | — | `value` or `textInput` (per widget) | — |
| Logic (`and`, `or`) | — | `leftOperand`, `rightOperand` | — |

Slot key names must match each widget's `slots` object keys in source (inspect each widget class).

### 3.3 Recommended widget serialization contract

Add an optional interface (or methods on `GenericWidgetBase`) so configurable widgets own their config shape:

```typescript
interface WidgetSerialization {
  /** Return config object for this widget instance; omit slots/bodies */
  serializeConfig?(): Record<string, unknown>;
  /** Apply config without opening modals; return false if invalid */
  applyConfig?(config: Record<string, unknown>): boolean;
}
```

Default behavior for widgets without `serializeConfig`: emit no `config` field.

Block widgets (`if`, `if-else`, `while-loop`, `repeat-n`) can rely on the **central serializer** walking `getNestedExecutors()` and mapping executor container IDs to body names (`then`, `else`, `body`) via a small lookup table per widget type.

---

## 4. Serialization Flow (Save)

```
mainExecutorRef.current
  └─ getWidgets()  →  for each statement widget
       ├─ serializeWidget(widget)
       │    ├─ id, type
       │    ├─ config (if any)
       │    ├─ slots (recursive)
       │    └─ bodies (recursive per nested executor)
       └─ build CodeDamProjectFile
            └─ JSON.stringify → Blob → download
```

**Important:** Walk `widgetMap` only for slot widgets via parent `slots` references — the saved tree is the **canonical** structure (`statements` + nested `slots` + `bodies`), not a flat map.

---

## 5. Deserialization Flow (Load)

```
File → JSON.parse → validate CodeDamProjectFile
  └─ executor.clear() on main executor (and stop execution if active)
  └─ for runner "canvas" (phase 1):
       └─ deserializeRunner(executor, serializedRunner)
            └─ for each SerializedWidget in statements (in order):
                 ├─ createWidgetWithId(type, id)
                 ├─ applyConfig (no modal)
                 ├─ deserialize slots (registerSlot path, skip initWidget modal)
                 ├─ deserialize bodies into nested executors
                 └─ registerVariable for createVar/createConst
  └─ notifyChange() + forceUpdate()
```

**ID restoration:** Add `Executor.createWidgetWithId(WidgetClass, id: string)` that instantiates the widget and assigns the saved ID (either extend constructor to accept optional id, or add `protected restoreId(id: string)` on `GenericWidgetBase` called immediately after `new`).

**Variable references:** Because IDs are preserved, `selectedVariableId` in `setVar` / `useVar` config can be applied directly. Optionally validate that referenced IDs exist after full load.

**Order:** Deserialize statements in array order. Slot widgets and body widgets are created as nested steps before moving to the next sibling — depth-first is natural and matches tree structure.

### 5.1 Full state reset on load (required)

Loading a file must **completely replace** the current project. The user must never see a mix of old and new widgets. The load handler orchestrates reset and restore in this order:

```
User confirms Load in modal
  │
  ├─ 1. Stop execution
  │     executionController.stop()  (or equivalent)
  │     → executionState = 'idle'
  │
  ├─ 2. Clear runtime / UI state (React state on playground page)
  │     setExecutionStack([])
  │     setActiveLineKeys(new Set())
  │     reset drag overlay state (activeOverId, overPosition, activeWidget)
  │
  ├─ 3. Erase design-time program state
  │     mainExecutor.clear()
  │     → all widgets cleaned up (nested executors included via widget.cleanup())
  │     → widgets[], widgetMap, variableStack, slotMap emptied
  │     → execution stack on executor cleared via clearExecutionStack()
  │
  ├─ 4. Deserialize loaded file into the now-empty executor
  │     loadProject(mainExecutor, validatedFile)
  │
  ├─ 5. Apply editor preferences from file (if present)
  │     e.g. setCodeLanguage(file.preferences.codeLanguage)
  │
  └─ 6. Refresh UI
        mainExecutor.notifyChange()
        forceUpdate()
```

**`Executor.clear()` must be thorough.** It should iterate top-level `widgets` and call `widget.cleanup()` on each so nested executors and slot widgets are destroyed before maps are reset. Do not leave orphaned widgets in nested `thenExecutor` / `bodyExecutor` instances.

**Validation errors** during load: do **not** call `clear()` until the file is parsed and passes `validateProjectFile`. If validation fails after the user selected a file, show the error inside the Load modal and keep the current canvas unchanged.

**Non-empty canvas warning:** If the canvas already has widgets, the Load modal shows an inline warning (“This will replace your current project.”) before the user clicks **Load**. No separate confirmation dialog is required unless you prefer a two-step confirm — the modal itself carries the warning.

---

## 6. User Interface Specification

This section defines the **Save** and **Load** buttons and their modals. Both are required for the first release — not optional polish.

### 6.1 Button placement — `main-canvas-header`

Save and Load live in the **main canvas header** on the playground page — not in the global app header, not in a separate toolbar above the page.

**File:** `src/pages/playground/Page.tsx`  
**Element:** `<div className="main-canvas-header">` (styled in `src/pages/playground/Page.scss`)

#### Current layout (to change)

```tsx
<div className="main-canvas-header flex items-center justify-between">
  <h2>Build Your Dam</h2>
  <p>Drag planks from the workshop to build your program!</p>  {/* REMOVE */}
</div>
```

The right-side helper paragraph **must be removed**. It is replaced by the Save and Load buttons.

#### Target layout

```
┌─────────────────────────────────────────────────────────────┐
│  main-canvas-header (green gradient bar)                    │
│                                                             │
│  Build Your Dam                          [ Save ] [ Load ]  │
│  ← h2, left                              ← buttons, right   │
└─────────────────────────────────────────────────────────────┘
```

```tsx
<div className="main-canvas-header flex items-center justify-between">
  <h2>Build Your Dam</h2>
  <div className="main-canvas-header-actions flex items-center gap-2">
    {/* Save and Load buttons */}
  </div>
</div>
```

| Button | Label | Icon suggestion |
|--------|-------|-----------------|
| Save | “Save” | Download style (e.g. Heroicons `ArrowDownTrayIcon`) |
| Load | “Load” | Upload style (e.g. Heroicons `ArrowUpTrayIcon`) |

**Alignment:** Buttons sit on the **right** of the header, vertically centered with the title. The existing `justify-between` flex layout keeps `h2` left and actions right.

**Styling:** Match the header bar — white text/icons on the green gradient background. Use compact button styles (e.g. outlined or subtle white/transparent buttons) so they read clearly on `main-canvas-header`. Add styles under `.main-canvas-header` in `Page.scss` (e.g. `.main-canvas-header-actions`).

**Optional extraction:** Button markup and click handlers may live in a small `ProjectToolbar` component, but it must render **inside** `main-canvas-header` on the right — not elsewhere on the page.

**Modals:** Register `SaveProjectModal` and `LoadProjectModal` at app level in `App.tsx` (same pattern as `ConfigModal` / `ConfirmationModal`). Only the **buttons** belong in the canvas header.

**Disabled when:** `executionState` is `'running'` or `'paused'` (same rule as `isEditingLocked` in `DragContext`). Show a `title` tooltip: “Stop execution before saving or loading.”

**Do not remove:** The empty-canvas hint inside the droppable area (`“Drop planks here to build your dam!”`) — that stays as-is; only the header helper text is removed.

### 6.2 Save flow (button → modal → download)

```
[Save button] ──click──► SaveProjectModal opens
                              │
                              ├─ Text input: “Project name” (required)
                              ├─ Helper text: “File will be saved as {name}.codedam.json”
                              ├─ [Cancel]  → close modal, no download
                              └─ [Save]    → validate name → serialize → download → close modal
```

**SaveProjectModal contents:**

| Element | Behavior |
|---------|----------|
| Title | “Save project” |
| Name input | Pre-filled with last saved name or `metadata.name` from current session if available; otherwise empty |
| Validation | Name required (trimmed non-empty); reject `/ \ : * ? " < > \|` and leading/trailing dots; max length ~100 chars |
| Cancel | Closes modal; no file written |
| Save (primary) | Disabled while name invalid or while save in progress |

**On Save confirm:**

1. Build `CodeDamProjectFile` via `serializeProject(mainExecutor, { codeLanguage })`.
2. Set `metadata.name` to the trimmed user input; set `metadata.updatedAt` to now (ISO 8601).
3. Call `downloadJsonFile(\`${sanitizedName}.codedam.json\`, project)`.
4. Close modal.

Follow the existing modal stack: **Headless UI `Dialog`** + singleton manager pattern used by `ConfigModal` and `ConfirmationModal` (`src/components/ConfigModal/ConfigModal.tsx`).

### 6.3 Load flow (button → modal → upload → restore)

```
[Load button] ──click──► LoadProjectModal opens
                              │
                              ├─ File picker area (browse + optional drag-and-drop)
                              ├─ Shows selected file name once chosen
                              ├─ Warning banner if canvas is non-empty
                              ├─ Error area for parse/validation failures
                              ├─ [Cancel]  → close modal, canvas unchanged
                              └─ [Load]    → read file → validate → reset → deserialize → close modal
```

**LoadProjectModal contents:**

| Element | Behavior |
|---------|----------|
| Title | “Load project” |
| File input | `<input type="file" accept=".json,.codedam,.codedam.json,application/json">` hidden; triggered by “Browse…” button |
| Drop zone (optional) | Accept `.json` / `.codedam` files dragged onto the modal |
| Selected file | Display `filename` after selection; **Load** disabled until a file is selected |
| Warning | If `mainExecutor.getWidgets().length > 0`, show: “Loading will replace your current project. This cannot be undone.” |
| Error display | Inline red text for JSON parse errors, invalid format, unsupported version |
| Cancel | Closes modal; discards selected file; canvas unchanged |
| Load (primary) | Disabled until file selected; shows loading state while processing |

**On Load confirm:**

1. Read file with `FileReader` → `JSON.parse`.
2. Run `validateProjectFile(data)`. On failure: show errors in modal, **do not** clear canvas.
3. On success: run the full reset + restore sequence from §5.1.
4. Close modal on success. Optionally show a brief success message (“Project loaded.”).
5. If deserialize emits warnings (unknown widget types), show them after load (modal footer or toast).

The file picker lives **inside the Load modal**, not as a detached hidden input on the page. The modal is the single place where the user chooses and confirms the file to restore.

### 6.4 Modal components to create

| Component | Path | Singleton export |
|-----------|------|------------------|
| `SaveProjectModal` | `src/components/SaveProjectModal/` | `saveProjectModal` |
| `LoadProjectModal` | `src/components/LoadProjectModal/` | `loadProjectModal` |

**API shape (mirrors existing modals):**

```typescript
// Save
saveProjectModal.open({ initialName?: string }): Promise<{ name: string } | null>

// Load
loadProjectModal.open({ hasExistingProject: boolean }): Promise<{ file: File } | null>
// Or resolve null on cancel; actual read/validate/restore handled by Page callback after modal returns File
```

Register both modal components in `App.tsx` next to `ConfirmationModal` and `ConfigModal`.

### 6.5 Download utility

`src/utils/fileDownload.ts`:

```typescript
export function downloadJsonFile(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### 6.6 File read utility

`src/utils/fileRead.ts` (or `fileUpload.ts`):

```typescript
export function readJsonFile(file: File): Promise<unknown> {
  // FileReader → text → JSON.parse; reject with readable Error on failure
}
```

Used by the Load modal / playground handler — not a standalone page-level file picker.

### 6.7 Playground wiring

In `src/pages/playground/Page.tsx`, place buttons in **`main-canvas-header`** (see §6.1). Handlers may live on `Page` or in a `ProjectToolbar` child rendered inside the header actions area:

```typescript
// Inside main-canvas-header, right side:
<ProjectToolbar
  executionState={executionState}
  onSave={handleSaveClick}
  onLoad={handleLoadClick}
/>

const handleSaveClick = async () => {
  const result = await saveProjectModal.open({ initialName: lastProjectName });
  if (!result) return;
  const project = serializeProject(mainExecutorRef.current!, { codeLanguage });
  project.metadata = { ...project.metadata, name: result.name, updatedAt: new Date().toISOString() };
  downloadJsonFile(`${sanitizeFilename(result.name)}.codedam.json`, project);
  setLastProjectName(result.name);
};

const handleLoadClick = async () => {
  const hasExisting = mainExecutorRef.current!.getWidgets().length > 0;
  const result = await loadProjectModal.open({ hasExistingProject: hasExisting });
  if (!result) return;
  const data = await readJsonFile(result.file);
  const validation = validateProjectFile(data);
  if (!validation.ok) { /* show error — keep canvas */ return; }
  await restoreProject(validation.file); // implements §5.1 reset + loadProject
};
```

Extract `restoreProject` into a named function so the reset sequence is explicit and testable.

---

## 7. Executor API Additions

The following methods on `Executor` (in `src/libraries/CodeBuilder/Executor.ts`) support save/load:

| Method | Purpose |
|--------|---------|
| `createWidgetWithId(class, id)` | Create widget with preserved ID |
| `clear()` | Remove all widgets, variables, slot maps; notify change |
| `loadWidgetSilent(class, id, config?)` | Create + apply config without `initWidget()` modal |
| `loadSlotSilent(parentId, slotName, serialized)` | Deserialize expression into slot |

Alternatively, keep `Executor` thinner and put tree logic in `ProjectSerializer.ts` / `ProjectDeserializer.ts` that call existing package-private patterns via new friend methods.

---

## 8. Implementation Tasks (AI-Executable Steps)

Each task is intentionally small. Complete them in order unless noted. After each task, run the app and verify nothing regressed.

---

### Phase A — Foundation

> **Status: ✅ Complete** (2026-06-25)

#### Task A1: Define TypeScript types for the file format ✅

**Create:** `src/libraries/CodeBuilder/persistence/types.ts`

- Export `CodeDamProjectFile`, `SerializedRunner`, `SerializedWidget`, `PROJECT_FORMAT`, `CURRENT_VERSION`.
- Export type guards: `isCodeDamProjectFile(value: unknown): value is CodeDamProjectFile`.

**Acceptance:** Types compile; no runtime changes yet.

---

#### Task A2: Create widget type registry ✅

**Create:** `src/libraries/CodeBuilder/widgetRegistry.ts`

- Move widget class list from `Page.tsx` into `WIDGET_REGISTRY` keyed by `getType()`.
- Export `getWidgetClass(type: string)` and `getAllWidgetClasses()`.
- Update `Page.tsx` to import `getAllWidgetClasses()` for toolbox and drag-drop (behavior unchanged).

**Acceptance:** Playground works identically; toolbox shows all widgets.

---

#### Task A3: Support restoring widget IDs on create ✅

**Modify:** `GenericWidgetBase.ts`, `Executor.ts`

- Allow optional `id` in widget construction:
  - Option A (preferred): `constructor(executor, options?: { id?: string })` — use provided id or `nanoid()`.
  - Update `createWidget` / new `createWidgetWithId(class, id)` to pass id.
- Ensure `widgetMap` uses the restored id.

**Implementation note:** Subclass constructors still call `super(executor)` only. `createWidgetWithId` sets a pending ID on `Executor` that `GenericWidgetBase` consumes via `consumePendingWidgetId()`, so all 27 widget files did not need updating.

**Acceptance:** Unit-level check: `createWidgetWithId` results in `widget.id === passedId`.

---

#### Task A4: Add Executor.clear() ✅

**Modify:** `Executor.ts`

- Implement `clear()`:
  - For each top-level widget, call `cleanup()` (or iterate `widgetMap` safely).
  - Reset `widgets`, `widgetMap`, `variableStack`, `slotMap`.
  - Call `clearExecutionStack()` to drop runtime variable tracking.
  - Do not clear execution callbacks (`onChange`).
  - Call `notifyChange()` once at end.
- Handle nested executors via widget `cleanup()`.

**Acceptance:** After `clear()`, `getWidgets()` is empty and UI shows empty canvas.

---

### Phase B — Serialization (Save)

> **Status: ✅ Complete** (2026-06-25)

#### Task B1: Implement per-widget config serialization helpers ✅

**Create:** `src/libraries/CodeBuilder/persistence/widgetConfig.ts`

- For each configurable widget type, add `serializeXConfig(widget)` and `applyXConfig(widget, config)` using the same field shapes as existing `*ConfigForm.tsx` interfaces.
- Reuse `getConfigFromValue` / `getValueFromConfig` for `usePrimitiveValue`.

**Acceptance:** For a manually constructed `CreateVarWidget` with `name = "foo"`, round-trip config equals `{ name: "foo" }`.

---

#### Task B2: Implement serializeWidget() recursive function ✅

**Create:** `src/libraries/CodeBuilder/persistence/serialize.ts`

- `serializeWidget(widget): SerializedWidget`
  - `id`, `type` from instance / class
  - `config` via widgetConfig helpers
  - `slots`: for each non-null entry in `widget.slots`, recurse
  - `bodies`: map nested executors to body names:
    - `if` → `{ then: serializeExecutor(thenExecutor) }`
    - `if-else` → `{ then, else }`
    - `while-loop`, `repeat-n` → `{ body }`
- `serializeExecutor(executor): SerializedWidget[]` — map `getWidgets()` in order
- `serializeProject(mainExecutor, preferences?): CodeDamProjectFile` — build full file with `runners.canvas`

**Acceptance:** With a few widgets on canvas, `serializeProject` returns valid JSON matching §2.3 shape.

---

#### Task B3: Add download utility and SaveProjectModal ✅

**Create:** `src/utils/fileDownload.ts`, `src/utils/sanitizeFilename.ts`

**Create:** `src/components/SaveProjectModal/` (component + singleton `saveProjectModal`)

- Headless UI `Dialog`; name text input; Cancel / Save buttons
- Validate project name (required, no illegal filename characters)
- `saveProjectModal.open({ initialName? })` resolves `{ name }` or `null`

**Register** `SaveProjectModal` in `App.tsx`.

**Acceptance:** Modal opens, validates empty name, returns trimmed name on Save, null on Cancel.

---

#### Task B4: Add Save/Load buttons to `main-canvas-header` ✅

**Create (optional):** `src/components/ProjectToolbar/ProjectToolbar.tsx` — Save + Load buttons only; no title or helper text

**Modify:** `src/pages/playground/Page.tsx`, `src/pages/playground/Page.scss`

- In `main-canvas-header`: **remove** `<p>Drag planks from the workshop to build your program!</p>`
- Add `main-canvas-header-actions` on the **right** with Save and Load buttons (keep `h2` “Build Your Dam” on the left)
- Wire Save → `saveProjectModal.open` → `serializeProject` → `downloadJsonFile`
- Disable both buttons while execution is running/paused
- Track `lastProjectName` in component state for pre-filling the Save modal
- Style buttons for the green gradient header in `Page.scss`

**Note:** Load button is visible and disabled during execution; full Load flow is wired in Phase C (Task C5).

**Acceptance:** Header shows title left, Save/Load right; helper paragraph gone; Save opens modal and downloads file.

---

### Phase C — Deserialization (Load)

> **Status: ✅ Complete** (2026-06-25)

#### Task C1: Implement validation and error types ✅

**Create:** `src/libraries/CodeBuilder/persistence/validate.ts`

- `validateProjectFile(data: unknown): { ok: true, file: CodeDamProjectFile } | { ok: false, errors: string[] }`
- Check `format`, `version`, `runners.canvas` exists for phase 1 (if present, validate structure; missing canvas is allowed — yields empty load).

**Acceptance:** Invalid JSON shape returns readable errors; valid example from §2.3 passes.

---

#### Task C2: Implement silent widget creation (no modals) ✅

**Modify:** `Executor.ts` and/or widget classes

- Add load path that:
  - Creates widget with `createWidgetWithId`
  - Calls `applyConfig` instead of `initWidget()` for configurable widgets
  - For `createVar` / `createConst`, calls `registerVariable` after config applied
- For `RepeatNWidget`, rely on constructor to create `LoopIndexVariable` (no extra step)

**Acceptance:** Deserializing a `createVar` does not open config modal; variable appears in stack.

---

#### Task C3: Implement deserializeWidget() recursive function ✅

**Create:** `src/libraries/CodeBuilder/persistence/deserialize.ts`

- `deserializeWidget(executor, data, options)`:
  - Resolve class from registry; error if unknown type (collect warning, skip widget)
  - Create with id, apply config
  - Deserialize slots: create child widgets, call parent's `registerSlot`, update `slotMap` on executor
  - Deserialize bodies: get nested executor from widget (`thenExecutor`, etc.), recurse statements
- `deserializeRunner(executor, runner: SerializedRunner)`
- `loadProject(mainExecutor, file: CodeDamProjectFile)`:
  - Assumes caller already ran pre-load reset (§5.1 steps 1–3)
  - Deserialize `runners.canvas` only (phase 1)
  - Apply `preferences.codeLanguage` to page state if present

**Create:** `restoreProject()` orchestrator in `src/pages/playground/restoreProject.ts` that implements the full §5.1 sequence: stop execution → clear React UI state → `executor.clear()` → `loadProject` → notify + forceUpdate.

**Implementation note:** `Executor.loadWidgetSilent`, `appendStatementWidget`, `linkSlotWidget`, and `getWidget` support the deserialize path without opening config modals.

**Acceptance:** Save → Load round-trip restores the same widget count, types, config, and nesting. Loading onto a non-empty canvas leaves no old widgets behind.

---

#### Task C4: Create LoadProjectModal and file read utility ✅

**Create:** `src/utils/fileRead.ts`

**Create:** `src/components/LoadProjectModal/` (component + singleton `loadProjectModal`)

- File browse button + hidden file input (`accept=".json,.codedam,.codedam.json,application/json"`)
- Optional drag-and-drop zone for the same extensions
- Display selected filename; inline error area for parse/validation messages
- Warning banner when `hasExistingProject` is true (passed from Page)
- Cancel / Load buttons; Load disabled until file selected

**Register** `LoadProjectModal` in `App.tsx`.

**Acceptance:** Modal opens, file can be selected, warning shows when canvas non-empty, Cancel returns null without side effects.

---

#### Task C5: Wire Load button in `main-canvas-header` ✅

**Modify:** `ProjectToolbar` / `Page.tsx` (buttons already in header from Task B4)

- Wire **Load** → `loadProjectModal.open({ hasExistingProject })`
- Modal reads and validates the file before closing; on validation failure errors stay in the modal and the canvas is unchanged
- On success: call `restoreProject(file)` (§5.1) → modal closes

**Acceptance:** User clicks Load in the canvas header → picks file in modal → canvas fully erased → loaded project appears.

---

### Phase D — Polish & hardening

> **Status: ✅ Complete** (2026-06-25)

#### Task D1: Round-trip integration test ✅

**Create:** `src/libraries/CodeBuilder/persistence/__tests__/roundTrip.test.ts`

- Build a representative project in memory (createVar + if + addition in slot).
- `serializeProject` → `loadProject` on fresh executor → compare structure.

**Implementation note:** Added `vitest` dev dependency and `test` block in `vite.config.ts`. Tests cover round-trip equality, nested if bodies, empty `runners`, and unknown widget type warnings.

**Acceptance:** Test passes; documents expected behavior.

---

#### Task D2: Handle edge cases ✅

**Modify:** deserialize/validate as needed

- Unknown widget `type`: skip widget, aggregate warnings, show after load
- Missing `selectedVariableId` target: keep config but widget shows "not set" (current UI behavior)
- Empty file / empty runners: load empty canvas
- Malformed JSON: catch and show error

**Implementation note:** Validation no longer requires `runners.canvas` (missing canvas → empty load with warning). `deserializeWidget` / `deserializeRunner` wrap failures in warnings instead of throwing. Optional `statements` on a runner defaults to `[]`.

**Acceptance:** No uncaught exceptions on bad input.

---

#### Task D3: UI polish and edge-case UX ✅

**Modify:** SaveProjectModal, LoadProjectModal, `main-canvas-header` / `ProjectToolbar`, `Page.scss`

- Header buttons visually fit the green gradient bar (contrast, hover, disabled state)
- Consistent styling with `ConfigModal` / `ConfirmationModal` for modals
- Loading spinner on Load while file is being read/restored
- Show deserialize warnings (unknown widget types) after successful load
- `metadata.updatedAt` set on each save
- Keyboard: Enter submits Save modal when valid; Escape cancels both modals

**Implementation note:** Load modal shows spinning icon during file read/validate. Page shows a restoring overlay during `restoreProject` and a dismissible amber warnings banner when deserialize emits warnings. Header buttons get `:focus-visible` ring.

**Acceptance:** Save/Load sit correctly in canvas header; modals feel native; load errors never wipe the canvas.

---

### Phase E — Future multi-runner support (not phase 1)

These tasks are **out of scope** for the first release but the format already supports them:

#### Task E1: Serialize additional runners

When function runners exist, call `serializeExecutor` for each and add entries to `runners` beyond `canvas`.

#### Task E2: Deserialize additional runners

Create executors per runner id; wire each to its droppable canvas component.

#### Task E3: Cross-runner references (if needed)

If functions can call each other, extend `config` or add a `references` section — design when the function feature is specified.

---

## 9. Suggested File Layout (new code)

```
src/components/
├── SaveProjectModal/
│   ├── SaveProjectModal.tsx
│   └── index.ts
├── LoadProjectModal/
│   ├── LoadProjectModal.tsx
│   └── index.ts
└── ProjectToolbar/
    ├── ProjectToolbar.tsx   # Save + Load only; rendered inside main-canvas-header
    └── index.ts

src/libraries/CodeBuilder/
├── persistence/
│   ├── types.ts           # CodeDamProjectFile, SerializedWidget, ...
│   ├── widgetConfig.ts    # per-widget config serialize/apply
│   ├── serialize.ts       # tree → file
│   ├── deserialize.ts     # file → tree (loadProject)
│   ├── validate.ts        # schema checks
│   └── restoreProject.ts  # optional: full §5.1 orchestrator
├── widgetRegistry.ts      # type → class map
└── Executor.ts            # createWidgetWithId, clear, ...

src/utils/
├── fileDownload.ts
├── fileRead.ts
└── sanitizeFilename.ts

src/pages/playground/
├── Page.tsx                 # main-canvas-header: h2 left, ProjectToolbar right
└── Page.scss                # .main-canvas-header-actions button styles
```

---

## 10. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Variable references break if IDs change | Always preserve `id` on load; never regenerate ids during deserialize |
| `initWidget()` opens modals during load | Separate silent `applyConfig` + `loadWidgetSilent` path |
| New widget types added later | Registry + unknown-type warnings; version field for migrations |
| Large projects slow to parse | JSON is fine for v1; monitor size; optional minify later |
| Partial load leaves old widgets | Validate file **before** `clear()`; only erase canvas after validation succeeds |
| User loads file mid-execution | Stop execution first; respect `isEditingLocked` on buttons |
| `TextBuilder` dynamic slots | Serialize `componentCount` in config **and** only occupied slot keys |
| Nested executor `onChange` not wired after load | After deserialize, ensure block widgets still set nested `executor.setOnChange(() => parent.notifyChange())` — constructor already does this if widgets are created via `new WidgetClass(executor)` |

---

## 11. Manual Test Checklist (after Phase C)

> **Verified:** 2026-06-25 — UI via browser on `http://localhost:5174/playground`; restore/round-trip via `npm test` (`roundTrip.test.ts`, `manualChecklist.test.ts`). File-picker flows (browse/drag, download filename on disk) require a human click in the browser.

### Save modal
- [x] Save button visible in `main-canvas-header` (right side)
- [x] Header no longer shows “Drag planks from the workshop…” text
- [x] “Build Your Dam” title still shown on the left
- [x] Empty name disables Save / shows validation
- [x] Cancel closes modal without download
- [x] Valid name → file downloads as `{name}.codedam.json` *(modal shows `My test project.codedam.json`, Save closes; download triggered via `downloadJsonFile` — confirm file in Downloads manually)*
- [x] Save disabled during execution

### Load modal
- [x] Load button opens modal with file picker
- [x] Load disabled until file selected
- [ ] Non-empty canvas shows replacement warning in modal *(not browser-automated — file input blocked; logic passes `hasExistingProject` from `getWidgets().length`)*
- [x] Cancel closes modal; canvas unchanged
- [ ] Invalid JSON / invalid format shows error in modal; canvas unchanged *(invalid format/json covered in `manualChecklist.test.ts`; modal UI needs manual file pick)*

### Restore behavior
- [x] Load valid file on empty canvas → widgets appear *(vitest + fixture `valid-project.codedam.json`)*
- [x] Load valid file on non-empty canvas → **all** old widgets gone, only loaded widgets remain
- [x] Nested blocks (if/while/repeat) fully replaced, not merged
- [x] Variable references still work after load
- [x] Execution state reset to idle; variable stack panel empty *(vitest: `restoreProject` calls `stop()` and `clear()`; UI panel depends on React state reset in `Page.tsx`)*
- [x] Code preview after load matches preview before save

### Round-trip content
- [x] CreateVar + primitive value → Save → Load → name and value slot restored
- [x] SetVar / UseVar → Save → Load → still reference correct variable
- [x] If / If-Else / While / Repeat-N with nested statements → bodies restored in correct branch
- [x] TextBuilder with 3 components → slot count and expressions restored
- [x] UserInput settings (title, valueType) restored

---

## 12. Summary

| Question | Recommendation |
|----------|----------------|
| Format | Versioned JSON (`codedam-project` v1) |
| File extension | `.codedam.json` |
| Multi-runner | `runners` map; only `canvas` in v1 |
| ID strategy | Preserve widget IDs in file |
| Registry | Central `widgetRegistry.ts` keyed by `getType()` |
| Config | Per-widget serialize/apply helpers; no modals on load |
| Save UI | **Save** button in `main-canvas-header` (right) → **SaveProjectModal** → download |
| Load UI | **Load** button in `main-canvas-header` (right) → **LoadProjectModal** → restore |
| Load reset | Stop execution → clear UI state → `executor.clear()` → deserialize (§5.1) |
| Entry points | Save/Load in `main-canvas-header` (right); modals in `App.tsx` |
| Core new modules | `persistence/serialize.ts`, `deserialize.ts`, `types.ts`, `SaveProjectModal`, `LoadProjectModal` |

Execute **Phase A → B → C → D** in order. Phase E when functions/multi-runner UI is implemented.
