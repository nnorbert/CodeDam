import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ToolBoxItem, { type ToolboxItemData } from "../../components/ToolBoxItem/ToolBoxItem";
import ToolBox from "../../components/ToolBox/ToolBox";
import CodePreview from "../../components/CodePreview/CodePreview";
import { Executor } from "../../libraries/CodeBuilder/Executor";
import { CreateVarWidget } from "../../libraries/CodeBuilder/widgets/variables/CreateVarWidget";

// ------------------ Sortable Canvas Item ------------------
function SortableItem({
  id,
  children,
  activeRegion,
}: {
  id: string;
  children: React.ReactNode;
  activeRegion?: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, data: { xxx: "yyy" } });

  const style: React.CSSProperties = {
    flexShrink: 0,
    transform: CSS.Transform.toString(transform),
    transition:
      transition && transition.includes("0ms")
        ? "transform 200ms ease"
        : transition ?? "transform 200ms ease",
    minHeight: "60px",
    width: "fit-content",
    zIndex: isDragging ? 50 : "auto",
    outline: isDragging ? "3px solid rgba(99,102,241,0.9)" : "none",
  };

  const shadow =
    activeRegion === "top"
      ? "shadow-[0_-4px_6px_rgba(59,130,246,0.6)]"
      : activeRegion === "bottom"
        ? "shadow-[0_4px_6px_rgba(59,130,246,0.6)]"
        : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-green-200 rounded shadow cursor-move transition-colors box-border flex flex-col items-start justify-center ${shadow}`}
    >
      {children}
    </div>
  );
}

// ------------------ Droppable Canvas ------------------
function DroppableCanvas({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  return (
    <div
      ref={setNodeRef}
      className={`border p-4 rounded flex flex-col ${
        isOver ? "bg-blue-50" : "bg-white"
      }`}
      style={{
        height: "100%",
        overflow: "hidden",
      }}
    >
      <h2 className="font-bold mb-2">Canvas</h2>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
        {children}
      </div>
    </div>
  );
}

// ------------------ Playground ------------------
export default function Playground() {
  const [canvasWidgets, setCanvasWidgets] = useState<
    { id: string; type: string; label: string }[]
  >([]);
  const [activeOverId, setActiveOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<string | null>(null);
  const [activeWidget, setActiveWidget] = useState<ToolboxItemData | null>(null);
  const [isToolboxDrag, setIsToolboxDrag] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const [mainExecutor] = useState<Executor>(new Executor());

  const WIDGETS = [
    { type: "log", label: "Log 🪵", category: "variables", className: CreateVarWidget },
    { type: "array", label: "Array 📦", category: "logical" },
    { type: "object", label: "Object 🪵", category: "variables" },
  ];

  const widgets = [
    CreateVarWidget
  ];



  function handleDragStart(event: any) {
    setActiveOverId(event.active.id);

    if (event.active.id.startsWith("tool-")) {
      setIsToolboxDrag(true);
      const type = event.active.id.replace("tool-", "");
      const widget = WIDGETS.find((w) => w.type === type);
      setActiveWidget(widget || null);
    } else {
      setIsToolboxDrag(false);
    }
  }

  function handleDragMove(event: any) {
    if (!event.over) return;

    const activeRect = event.active.rect.current.translated;
    if (activeRect) {
      const pointerY = activeRect.top + activeRect.height / 2;
      const middleY = event.over.rect.top + event.over.rect.height / 2;
      setOverPosition(pointerY < middleY ? "top" : "bottom");
    }

    setActiveOverId(event.over?.id || null);
  }

  function handleDragCancel() {
    setActiveWidget(null);
    setIsToolboxDrag(false);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveOverId(null);
    setActiveWidget(null);
    setIsToolboxDrag(false);
    setOverPosition(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Toolbox → Canvas
    if (active.data.current?.isToolboxItem === true) {
      const widgetType = active.data.current?.type;
      const newWidget = {
        id: `${widgetType}-${Date.now()}`,
        type: widgetType,
        label: WIDGETS.find((w) => w.type === widgetType)?.label || widgetType,
      };

      if (active.data.current?.className) {
        const test = new active.data.current.className();
        console.log(test.id);
      }
      




      if (overId === "canvas") {
        setCanvasWidgets((prev) => [...prev, newWidget]);
      } else {
        const overIndex = canvasWidgets.findIndex((w) => w.id === overId);
        if (overIndex < 0) return;

        setCanvasWidgets((prev) =>
          overPosition === "top"
            ? [...prev.slice(0, overIndex), newWidget, ...prev.slice(overIndex)]
            : [...prev.slice(0, overIndex + 1), newWidget, ...prev.slice(overIndex + 1)]
        );
      }
      return;
    }

    // Reordering inside canvas
    if (!active.data.current?.isToolboxItem === true && !over.data.current?.isToolboxItem === true && activeId !== overId) {
      const oldIndex = canvasWidgets.findIndex((w) => w.id === activeId);
      const newIndex =
        overId === "canvas"
          ? canvasWidgets.length - 1
          : canvasWidgets.findIndex((w) => w.id === overId);

      if (oldIndex >= 0 && newIndex >= 0) {
        setCanvasWidgets((items) => arrayMove(items, oldIndex, newIndex));
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragCancel={handleDragCancel}
    >
      <div className="flex overflow-hidden" style={{ height: "calc(100vh - var(--header-height))" }}>
        {/* Toolbox */}
        <aside className="w-64 border-r bg-yellow-50 p-4 overflow-y-auto">
          <ToolBox widgets={WIDGETS}></ToolBox>
        </aside>

        {/* Canvas */}
        <main className="flex-1 flex flex-col p-4 overflow-hidden">
          <h2 className="font-bold text-lg mb-2">Canvas</h2>

          {/* The droppable area now expands to fill available height */}
          <div className="flex-1 min-h-0">
            <DroppableCanvas>
              <SortableContext
                items={canvasWidgets.map((w) => w.id)}
                strategy={verticalListSortingStrategy}
              >
                {canvasWidgets.length === 0 ? (
                  <div className="text-gray-400">Drag a widget here</div>
                ) : (
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-full p-1">
                    {canvasWidgets.map((w) => (
                      <SortableItem
                        key={w.id}
                        id={w.id}
                        activeRegion={
                          isToolboxDrag && activeOverId === w.id ? overPosition : null
                        }
                      >
                        {w.label}
                      </SortableItem>
                    ))}
                  </div>
                )}
              </SortableContext>
            </DroppableCanvas>
          </div>
        </main>

        {/* Code Preview */}
        <aside className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
          <CodePreview widgets={canvasWidgets} />
        </aside>
      </div>

      <DragOverlay>
        {activeWidget ? <ToolBoxItem widget={activeWidget} disabled /> : null}
      </DragOverlay>
    </DndContext>
  );
}
