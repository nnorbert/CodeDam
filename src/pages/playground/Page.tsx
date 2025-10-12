import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
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

// ------------------ Sortable Canvas Item ------------------
function SortableItem({
  id,
  label,
  activeRegion,
}: {
  id: string;
  label: string;
  activeRegion?: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    flexShrink: 0,
    transform: CSS.Transform.toString(transform),
    transition:
      transition && transition.includes("0ms")
        ? "transform 200ms ease"
        : transition ?? "transform 200ms ease",
    height: "120px",
    width: "140px",
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
      className={`p-3 bg-green-200 rounded shadow cursor-move transition-colors box-border ${shadow}`}
    >
      {label}
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


  const WIDGETS = [
    { type: "log", label: "Log 🪵", category: "variables" },
    { type: "array", label: "Array 📦", category: "logical" },
    { type: "object", label: "Object 🪵", category: "variables" },
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
    if (activeId.startsWith("tool-")) {
      const widgetType = activeId.replace("tool-", "");
      const newWidget = {
        id: `${widgetType}-${Date.now()}`,
        type: widgetType,
        label: WIDGETS.find((w) => w.type === widgetType)?.label || widgetType,
      };

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
    if (!activeId.startsWith("tool-") && !overId.startsWith("tool-") && activeId !== overId) {
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
                        label={w.label}
                        activeRegion={
                          isToolboxDrag && activeOverId === w.id ? overPosition : null
                        }
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DroppableCanvas>
          </div>
        </main>

        {/* Code Preview */}
        <aside className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
          <h2 className="font-bold text-lg mb-4">Code Preview</h2>
          <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
            {/* Here you’ll render the generated code later */}
            {JSON.stringify(canvasWidgets, null, 2)}
          </pre>
        </aside>
      </div>

      <DragOverlay>
        {activeWidget ? <ToolBoxItem widget={activeWidget} disabled /> : null}
      </DragOverlay>
    </DndContext>
  );
}
