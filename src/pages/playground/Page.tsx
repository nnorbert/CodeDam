import "./Page.css";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodePreview from "../../components/CodePreview/CodePreview";
import ControlPanel from "../../components/ControlPanel/ControlPanel";
import VariableStack from "../../components/VariableStack/VariableStack";
import DroppableCanvas from "../../components/DroppableCanvas/DroppableCanvas";
import SortableItem from "../../components/SortableItem/SortableItem";
import ToolBox from "../../components/ToolBox/ToolBox";
import ToolBoxItem, { type ToolboxItemData } from "../../components/ToolBoxItem/ToolBoxItem";
import { UserInputModal } from "../../components/UserInputModal";
import { UserOutputModal } from "../../components/UserOutputModal";
import { DragProvider } from "../../contexts/DragContext";
import CustomCollisionDetector from "../../libraries/CodeBuilder/CustomCollisionDetector";
import { Executor } from "../../libraries/CodeBuilder/Executor";
import { ExecutionController, type ExecutionState } from "../../libraries/CodeBuilder/ExecutionController";
import type { ExecutionStackSnapshot } from "../../libraries/CodeBuilder/ExecutionTypes";
import { CreateVarWidget } from "../../libraries/CodeBuilder/widgets/variables/CreateVarWidget/CreateVarWidget";
import { UseVarWidget } from "../../libraries/CodeBuilder/widgets/variables/UseVarWidget/UseVarWidget";
import { CANVAS_ID, DroppableTypes, WidgetRoles } from "../../utils/constants";
import { UsePrimitiveValueWidget } from "../../libraries/CodeBuilder/widgets/variables/UsePrimitiveValueWidget/UsePrimitiveValueWidget";
import { IfWidget } from "../../libraries/CodeBuilder/widgets/decisions/IfWidget/IfWidget";
import { IfElseWidget } from "../../libraries/CodeBuilder/widgets/decisions/IfElseWidget/IfElseWidget";
import { CreateConstWidget } from "../../libraries/CodeBuilder/widgets/variables/CreateConstWidget/CreateConstWidget";
import { SetVarWidget } from "../../libraries/CodeBuilder/widgets/variables/SetVarWidget/SetVarWidget";
import { AdditionWidget } from "../../libraries/CodeBuilder/widgets/operations/AdditionWidget/AdditionWidget";
import { SubtractionWidget } from "../../libraries/CodeBuilder/widgets/operations/SubtractionWidget/SubtractionWidget";
import { MultiplicationWidget } from "../../libraries/CodeBuilder/widgets/operations/MultiplicationWidget/MultiplicationWidget";
import { DivisionWidget } from "../../libraries/CodeBuilder/widgets/operations/DivisionWidget/DivisionWidget";
import { ModuloWidget } from "../../libraries/CodeBuilder/widgets/operations/ModuloWidget/ModuloWidget";
import { NegationWidget } from "../../libraries/CodeBuilder/widgets/conditions/NegationWidget/NegationWidget";
import { GreaterThanWidget } from "../../libraries/CodeBuilder/widgets/conditions/GreaterThanWidget/GreaterThanWidget";
import { GreaterOrEqualWidget } from "../../libraries/CodeBuilder/widgets/conditions/GreaterOrEqualWidget/GreaterOrEqualWidget";
import { LessThanWidget } from "../../libraries/CodeBuilder/widgets/conditions/LessThanWidget/LessThanWidget";
import { LessOrEqualWidget } from "../../libraries/CodeBuilder/widgets/conditions/LessOrEqualWidget/LessOrEqualWidget";
import { EqualWidget } from "../../libraries/CodeBuilder/widgets/conditions/EqualWidget/EqualWidget";
import { StrictEqualWidget } from "../../libraries/CodeBuilder/widgets/conditions/StrictEqualWidget/StrictEqualWidget";
import { AndWidget } from "../../libraries/CodeBuilder/widgets/conditions/AndWidget/AndWidget";
import { OrWidget } from "../../libraries/CodeBuilder/widgets/conditions/OrWidget/OrWidget";
import { UserInputWidget } from "../../libraries/CodeBuilder/widgets/interactions/UserInputWidget/UserInputWidget";
import { UserOutputWidget } from "../../libraries/CodeBuilder/widgets/interactions/UserOutputWidget/UserOutputWidget";
import { CodeLanguages, type CodeLanguageType } from "../../utils/constants";

// ------------------ Playground ------------------
export default function Playground() {
  const activeWidgets = [
    CreateVarWidget,
    CreateConstWidget,
    SetVarWidget,
    UsePrimitiveValueWidget,
    UseVarWidget,
    IfWidget,
    IfElseWidget,
    AdditionWidget,
    SubtractionWidget,
    MultiplicationWidget,
    DivisionWidget,
    ModuloWidget,
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
    UserOutputWidget
  ];
  const mainExecutorRef = useRef<Executor>(null);
  const executionControllerRef = useRef<ExecutionController>(null);

  if (!mainExecutorRef.current) {
    mainExecutorRef.current = new Executor(CANVAS_ID);
  }

  if (!executionControllerRef.current) {
    executionControllerRef.current = new ExecutionController();
  }

  const [, forceUpdate] = useState(0);
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [executionStack, setExecutionStack] = useState<ExecutionStackSnapshot>([]);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguageType>(CodeLanguages.JAVASCRIPT);

  // Subscribe to executor changes for re-rendering
  useEffect(() => {
    mainExecutorRef.current?.setOnChange(() => forceUpdate(n => n + 1));
    return () => mainExecutorRef.current?.setOnChange(null);
  }, []);

  // Subscribe to execution controller state changes
  useEffect(() => {
    executionControllerRef.current?.setOnStateChange((state) => {
      setExecutionState(state);
    });
    return () => executionControllerRef.current?.setOnStateChange(null);
  }, []);

  // Subscribe to widget changes to trigger re-render for highlighting
  useEffect(() => {
    executionControllerRef.current?.setOnWidgetChange(() => {
      forceUpdate(n => n + 1);
    });
    return () => executionControllerRef.current?.setOnWidgetChange(null);
  }, []);

  // Subscribe to execution stack changes
  useEffect(() => {
    executionControllerRef.current?.setOnExecutionStackChange(() => {
      const snapshot = executionControllerRef.current?.getExecutionStackSnapshot() ?? [];
      setExecutionStack(snapshot);
    });
    return () => executionControllerRef.current?.setOnExecutionStackChange(null);
  }, []);

  const [activeOverId, setActiveOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<string | null>(null);
  const [activeWidget, setActiveWidget] = useState<{ widget: ToolboxItemData } | null>(null);
  const [isToolboxDrag, setIsToolboxDrag] = useState(false);

  // Execution control handlers
  const handlePlay = useCallback(() => {
    if (!mainExecutorRef.current || !executionControllerRef.current) return;
    
    const controller = executionControllerRef.current;
    
    if (controller.getState() === 'idle' || controller.getState() === 'finished') {
      // Start fresh execution
      controller.start(mainExecutorRef.current);
    }
    
    // Start auto-play mode
    controller.play(1000);
  }, []);

  const handlePause = useCallback(() => {
    executionControllerRef.current?.pause();
  }, []);

  const handleStop = useCallback(() => {
    executionControllerRef.current?.stop();
  }, []);

  const handleStep = useCallback(async () => {
    await executionControllerRef.current?.step();
  }, []);

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

        // Handle register slot - use slotName from data (not overId which is now unique)
        const slotName = over.data.current.slotName;
        await executor.registerSlot(active.data.current.className, over.data.current.widgetId, slotName);
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

  // Editing is locked when execution is running or paused
  const isEditingLocked = executionState === 'running' || executionState === 'paused';

  // Memoize context value to avoid unnecessary re-renders
  const dragContextValue = useMemo(() => ({
    activeOverId,
    overPosition,
    isToolboxDrag,
    isEditingLocked,
  }), [activeOverId, overPosition, isToolboxDrag, isEditingLocked]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragCancel={handleDragCancel}
      collisionDetection={CustomCollisionDetector}
    >
      <DragProvider value={dragContextValue}>
        <div className="flex overflow-hidden" style={{ height: "calc(100vh - var(--header-height))" }}>
          {/* Toolbox - Workshop */}
          <aside className="w-64 border-r-2 border-amber-600/30 bg-gradient-to-b from-amber-100 to-amber-50 p-3 overflow-y-auto shadow-lg">
            <ToolBox widgets={activeWidgets}></ToolBox>
          </aside>

          {/* Canvas - The Dam Building Area */}
          <main className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="text-center mb-2">
              <h2 className="text-amber-800 font-bold text-lg">🦫 Build Your Dam</h2>
              <p className="text-amber-600/70 text-xs">Drag planks from the workshop to build your program!</p>
            </div>
            {/* The droppable area now expands to fill available height */}
            <div className="flex-1 min-h-0">
              <DroppableCanvas id={CANVAS_ID} executor={mainExecutorRef.current}>
                <SortableContext
                  items={mainExecutorRef.current.getWidgets().map((w) => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {mainExecutorRef.current.getWidgets().length === 0 ? (
                    <div className="text-amber-600/60 text-sm italic py-8 text-center">
                      🪵 Drop planks here to build your dam!
                    </div>
                  ) : (
                    <div className="flex flex-col overflow-y-auto max-h-full p-1">
                      {mainExecutorRef.current.getWidgets().map((w) => (
                        <SortableItem
                          key={w.id}
                          id={w.id}
                          executor={w.getExecutor()}
                          inExecution={w.inExecution}
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

          {/* Variable Stack, Code Preview & Control Panel */}
          <aside className="w-1/3 border-l-2 border-amber-600/30 bg-gradient-to-b from-amber-50 to-white flex flex-col shadow-lg">
            {/* Variable Stack & Code Preview - each takes 50% of available space */}
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Variable Stack - 50% */}
              <div className="flex-1 min-h-0 p-4 overflow-hidden">
                <VariableStack executionStack={executionStack} />
              </div>
              
              {/* Code Preview - 50% */}
              <div className="flex-1 min-h-0 p-4 pt-0 overflow-hidden">
                <CodePreview 
                  code={mainExecutorRef.current.getCodePreview(codeLanguage)} 
                  language={codeLanguage}
                  onLanguageChange={setCodeLanguage}
                />
              </div>
            </div>
            
            {/* Control Panel - fixed height */}
            <ControlPanel
              executionState={executionState}
              onPlay={handlePlay}
              onPause={handlePause}
              onStop={handleStop}
              onStep={handleStep}
            />
          </aside>
        </div>

        <DragOverlay>
          {activeWidget ? <ToolBoxItem widget={activeWidget.widget} disabled /> : null}
        </DragOverlay>

        {/* Global modals for user interaction */}
        <UserInputModal />
        <UserOutputModal />
      </DragProvider>
    </DndContext>
  );
}
