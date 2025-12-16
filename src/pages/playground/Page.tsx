import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useCallback, useRef, useState } from "react";
import CodePreview from "../../components/CodePreview/CodePreview";
import DroppableCanvas from "../../components/DroppableCanvas/DroppableCanvas";
import SortableItem from "../../components/SortableItem/SortableItem";
import ToolBox from "../../components/ToolBox/ToolBox";
import ToolBoxItem, { type ToolboxItemData } from "../../components/ToolBoxItem/ToolBoxItem";
import { UserInputModal } from "../../components/UserInputModal";
import CustomCollisionDetector from "../../libraries/CodeBuilder/CustomCollisionDetector";
import { Executor } from "../../libraries/CodeBuilder/Executor";
import { CreateVarWidget } from "../../libraries/CodeBuilder/widgets/variables/CreateVarWidget/CreateVarWidget";
import { UseVarWidget } from "../../libraries/CodeBuilder/widgets/variables/UseVarWidget/UseVarWidget";
import { CANVAS_ID, DroppableTypes, WidgetRoles } from "../../utils/constants";
import { UsePrimitiveValueWidget } from "../../libraries/CodeBuilder/widgets/variables/UsePrimitiveValueWidget/UsePrimitiveValueWidget";
import { IfWidget } from "../../libraries/CodeBuilder/widgets/conditions/IfWidget/IfWidget";

// ------------------ Playground ------------------
export default function Playground() {
  const activeWidgets = [
    CreateVarWidget,
    UsePrimitiveValueWidget,
    UseVarWidget,
    IfWidget
  ];
  const mainExecutorRef = useRef<Executor>(null);

  if (!mainExecutorRef.current) {
    mainExecutorRef.current = new Executor(CANVAS_ID);
  }

  const [activeOverId, setActiveOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<string | null>(null);
  const [activeWidget, setActiveWidget] = useState<{ widget: ToolboxItemData } | null>(null);
  const [isToolboxDrag, setIsToolboxDrag] = useState(false);
  const [, forceUpdate] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragStart(event: any) {
    setActiveOverId(event.active.id);

    if (event.active.data.current?.isToolboxItem) {
      setIsToolboxDrag(true);
      setActiveWidget({ widget: event.active.data.current.className });
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

  const handleDragEnd = useCallback(async (event: any) => {
    if (!mainExecutorRef.current) return;

    const { active, over } = event;
    const currentOverPosition = overPosition;

    setActiveOverId(null);
    setActiveWidget(null);
    setIsToolboxDrag(false);
    setOverPosition(null);


    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const executor = over.data.current?.executor;

    if (active.data.current?.isToolboxItem === true) {
      if (over.data.current?.type === DroppableTypes.SLOT) {
        if (active.data.current?.role !== WidgetRoles.EXPRESSION) {
          return;
        }

        // Handle register slot
        await executor.registerSlot(active.data.current.className, over.data.current.widgetId, overId);
        // Force re-render after initWidget completes (widget may have been updated)
        forceUpdate(n => n + 1);
        return;
      }

      // Toolbox → Canvas
      if (active.data.current?.role === WidgetRoles.STATEMENT) {
        await executor.registerWidget(active.data.current.className, overId, currentOverPosition || "bottom");
        // Force re-render after initWidget completes (widget may have been updated)
        forceUpdate(n => n + 1);
        return;
      }

      return;
    }

    // Reordering inside canvas
    if (active.data.current?.isSortableItem === true && over.data.current?.isSortableItem === true) {
      executor.reorderWidgets(activeId, overId);
      return;
    }
  }, [overPosition]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragCancel={handleDragCancel}
      collisionDetection={CustomCollisionDetector}
    >
      <div className="flex overflow-hidden" style={{ height: "calc(100vh - var(--header-height))" }}>
        {/* Toolbox */}
        <aside className="w-64 border-r bg-yellow-50 p-4 overflow-y-auto">
          <ToolBox widgets={activeWidgets}></ToolBox>
        </aside>

        {/* Canvas */}
        <main className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* The droppable area now expands to fill available height */}
          <div className="flex-1 min-h-0">
            <DroppableCanvas id={CANVAS_ID} executor={mainExecutorRef.current}>
              <SortableContext
                items={mainExecutorRef.current.getWidgets().map((w) => w.id)}
                strategy={verticalListSortingStrategy}
              >
                {mainExecutorRef.current.getWidgets().length === 0 ? (
                  <div className="text-gray-400">Drag a widget here</div>
                ) : (
                  <div className="flex flex-col overflow-y-auto max-h-full p-1">
                    {mainExecutorRef.current.getWidgets().map((w) => (
                      <SortableItem
                        key={w.id}
                        id={w.id}
                        activeRegion={
                          isToolboxDrag && activeOverId === w.id ? overPosition : null
                        }
                        executor={w.getExecutor()}
                      >
                        {w.render()}
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
          <CodePreview widgets={mainExecutorRef.current.getWidgets()} />
        </aside>
      </div>

      <DragOverlay>
        {activeWidget ? <ToolBoxItem widget={activeWidget.widget} disabled /> : null}
      </DragOverlay>

      {/* Global modal for user input requests */}
      <UserInputModal />
    </DndContext>
  );
}
