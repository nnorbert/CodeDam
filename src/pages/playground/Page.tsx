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
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";





// ------------------ Widget templates (toolbox) ------------------
const WIDGETS = [
  { type: "log", label: "Log 🪵" },
  { type: "array", label: "Array 📦" },
  { type: "object", label: "Object 🪵" },
];

// ------------------ Toolbox Item ------------------
function ToolboxItem({
  widget,
  isOverlay = false,
}: {
  widget: { type: string; label: string };
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `tool-${widget.type}`,
      disabled: isOverlay, // overlay should not be draggable
    });

  const style: React.CSSProperties = {
    // Only apply transform for overlay clone, not for original toolbox item
    transform: isOverlay
      ? CSS.Translate.toString(transform)
      : undefined,
    opacity: isOverlay ? 1 : isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(!isOverlay ? attributes : {})}
      {...(!isOverlay ? listeners : {})}
      className="w-20 h-20 m-2 flex items-center justify-center text-center bg-yellow-200 rounded-lg shadow cursor-grab"
    >
      {widget.label}
    </div>
  );
}


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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms ease", // fallback
    height: "120px",
    zIndex: isDragging ? 50 : "auto", // ensure dragged item is on top
    border: isDragging ? "2px solid red" : "none"
  };

  const shadow =
    activeRegion === "left"
      ? "shadow-[-4px_0_6px_rgba(59,130,246,0.6)]"
      : activeRegion === "right"
      ? "shadow-[4px_0_6px_rgba(59,130,246,0.6)]"
      : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-green-200 rounded shadow cursor-move transition-colors ${shadow}`}
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
      className={`flex-1 border p-4 rounded ${
        isOver ? "bg-blue-50" : "bg-white"
      }`}
    >
      <h2 className="font-bold mb-2">Canvas</h2>
      {children}
    </div>
  );
}






export default function Playground() {
  const [canvasWidgets, setCanvasWidgets] = useState<
    { id: string; type: string; label: string }[]
  >([]);
  const [overId, setOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<string | null>(null);
  const [activeWidget, setActiveWidget] = useState<{ type: string; label: string } | null>(null);
  const [isToolboxDrag, setIsToolboxDrag] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragStart(event: any) {
    setOverId(event.active.id);

    if (event.active.id.startsWith("tool-")) {
      setIsToolboxDrag(true); // toolbox → canvas
      const type = event.active.id.replace("tool-", "");
      const widget = WIDGETS.find((w) => w.type === type);
      setActiveWidget(widget || null);
    } else {
      setIsToolboxDrag(false); // reordering in canvas
    }
  }

  function handleDragOver(event: any) {
    setOverId(event.over?.id || null);
  }

  function handleDragMove(event: any) {
    if (!event.over) return null;

    const activeRect = event.active.rect.current.translated;
    if (activeRect) {
      const pointerX = activeRect.left + activeRect.right / 2; // middle of dragged item
      const middleX = event.over.rect.left + event.over.rect.right / 2;
      setOverPosition(pointerX < middleX ? "left" : "right");
    }

  }

  function handleDragCancel(event: any) {
    setActiveWidget(null);
    setIsToolboxDrag(false);
  }

  function handleDragEnd(event: any) {
    console.log("handleDragEvent", event);

    
    const { active, over } = event;
    setOverId(null);
    setActiveWidget(null);
    setIsToolboxDrag(false);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Case 1: Toolbox → Canvas
    if (activeId.startsWith("tool-")) {
      const widgetType = activeId.replace("tool-", "");
      const newWidget = {
        id: `${widgetType}-${Date.now()}`,
        type: widgetType,
        label:
          WIDGETS.find((w) => w.type === widgetType)?.label || widgetType,
      };

      if (overId === "canvas") {
        // Drop on empty canvas or after last
        setCanvasWidgets((prev) => [...prev, newWidget]);
      } else {
        const overIndex = canvasWidgets.findIndex((w) => w.id === overId);

        if (overIndex < 0) {
          return;
        }

        if (overPosition === "left") {
          // Insert before target          
            setCanvasWidgets((prev) => [
              ...prev.slice(0, overIndex),
              newWidget,
              ...prev.slice(overIndex),
            ]);
        } else if (overPosition === "right") {
          // Insert after target
          
            setCanvasWidgets((prev) => [
              ...prev.slice(0, overIndex + 1),
              newWidget,
              ...prev.slice(overIndex + 1),
            ]);
        }
      }
      return;
    }

    // Case 2: Reordering inside canvas
    if (!activeId.startsWith("tool-") && !overId.startsWith("tool-")) {
      if (activeId !== overId) {
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
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-6 p-6">
        {/* Toolbox */}
        <div className="grid grid-cols-2 gap-2">
          {WIDGETS.map((w) => (
            <ToolboxItem key={w.type} widget={w} />
          ))}
        </div>

        {/* Canvas */}
        <DroppableCanvas>
          <SortableContext
            items={canvasWidgets.map((w) => w.id)}
            strategy={horizontalListSortingStrategy}
          >
             {canvasWidgets.length === 0 ? (
              <div className="text-gray-400">Drag a widget here</div>
            ) : (
              <div className="flex gap-2">
                {canvasWidgets.map((w) => (
                  <React.Fragment key={w.id}>
                    <SortableItem
                      id={w.id}
                      label={w.label}
                      activeRegion={isToolboxDrag && overId === w.id ? overPosition : null}
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
          </SortableContext>
        </DroppableCanvas>
      </div>

      <DragOverlay>
        {activeWidget ? (
          <ToolboxItem widget={activeWidget} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
