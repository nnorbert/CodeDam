import React, { useEffect, useRef, useState } from "react";
import { NumberVarWidget } from "../../libraries/CodeBuilder/widgets/variables/NumberVarWidget";
import { AdditionWidget } from "../../libraries/CodeBuilder/widgets/executables/operations/Addition";
import { RemainderWidget } from "../../libraries/CodeBuilder/widgets/executables/operations/Remainder";
import { DivisionWidget } from "../../libraries/CodeBuilder/widgets/executables/operations/Division";
import { BooleanVarWidget } from "../../libraries/CodeBuilder/widgets/variables/BooleanVarWidget";
import { Executor } from "../../libraries/CodeBuilder/Executor";
import { MultiplicationWidget } from "../../libraries/CodeBuilder/widgets/executables/operations/Multiplication";
import { PrintVarWidget } from "../../libraries/CodeBuilder/widgets/executables/interactions/PrintVar";
import { ReadVarWidget } from "../../libraries/CodeBuilder/widgets/executables/interactions/ReadVar";
import { IfWidget } from "../../libraries/CodeBuilder/widgets/executables/conditionals/IfWidget";
import { GreaterThanOrEqualConditionWidget } from "../../libraries/CodeBuilder/widgets/conditions/GreaterThanOrEqualCondition";
import { TextVarWidget } from "../../libraries/CodeBuilder/widgets/variables/TextVarWidget";
import { IfElseWidget } from "../../libraries/CodeBuilder/widgets/executables/conditionals/IfElseWidget";
import DraggableWidget from "../../components/DraggableWidget/DraggableWidget";


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
function SortableItem({ id, label, activeRegion }: { id: string; label: string, activeRegion?: string | null }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: '120px'
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
      className={`p-3 bg-green-200 mb-2 rounded shadow cursor-move ${shadow}`}
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
  /*
  const isInitialized = useRef(false);
  const executor = useRef<Executor>(undefined);
  
  useEffect(()=>{
    if (isInitialized.current) return;
    isInitialized.current = true;

    const nrA = new NumberVarWidget('a');
    const nrB = new NumberVarWidget('b');
    const result = new NumberVarWidget('result');

    const w1 = new MultiplicationWidget();
    w1.setParameters(nrA, nrB); // 2 * 3
    w1.setResultVar(result);    // 6

    const w2 = new PrintVarWidget();
    w2.setParameters(result);

    executor.current = new Executor();
    executor.current.registerWidget(w1);
    executor.current.registerWidget(w2, w1.id);
    
    const readValue1 = new ReadVarWidget();
    readValue1.setResult(nrA);
    executor.current.registerWidget(readValue1);

    const readValue2 = new ReadVarWidget();
    readValue2.setResult(nrB);
    executor.current.registerWidget(readValue2, readValue1.id);

    const nrC = new NumberVarWidget("c", 50);
    const condA = new GreaterThanOrEqualConditionWidget();
    condA.setParameters(result, nrC);

    const ifW = new IfElseWidget();
    ifW.setParameters(condA);

    const str1 = new TextVarWidget('t', "Greater than 50");
    const str2 = new TextVarWidget('t', "Less than 50");
    const showText1 = new PrintVarWidget();
    showText1.setParameters(str1);
    const showText2 = new PrintVarWidget();
    showText2.setParameters(str2);

    ifW.registerThenWidget(showText1);
    ifW.registerElseWidget(showText2);

    executor.current.registerWidget(ifW, w2.id);
    
    console.log(result.value);
  }, []);

  const startExecute = () => {
    if (!executor.current) {
      return;
    }

    executor.current.execute();
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Playground 🦫</h1>
      <p className="text-lg">
        <button onClick={startExecute}>Play</button>
      </p>

    </div>
  );
  */

  // ======================================================

  const [canvasWidgets, setCanvasWidgets] = useState<
    { id: string; type: string; label: string }[]
  >([]);
  const [overId, setOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<string | null>(null);
  const [activeWidget, setActiveWidget] = useState<{ type: string; label: string } | null>(null);


  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragStart(event: any) {
    setOverId(event.active.id);

    if (event.active.id.startsWith("tool-")) {
      const type = event.active.id.replace("tool-", "");
      const widget = WIDGETS.find((w) => w.type === type);
      setActiveWidget(widget || null);
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

  function handleDragEnd(event: any) {
    console.log("handleDragEvent", event);

    
    const { active, over } = event;
    setOverId(null);
    setActiveWidget(null);
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
      onDragCancel={() => setActiveWidget(null)}
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
                    {overId === w.id ? (
                      <SortableItem id={w.id} label={w.label} activeRegion={overPosition}/>
                    ) : (
                      <SortableItem id={w.id} label={w.label} />
                    )}
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
