import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DroppableCanvas from "../../../../../components/DroppableCanvas/DroppableCanvas";
import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import SortableItem from "../../../../../components/SortableItem/SortableItem";
import { WidgetRoles } from "../../../../../utils/constants";
import type { IfWidget } from "./IfWidget";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";

const IfComponent = ({ widget }: { widget: IfWidget }) => {
  const bodyWidgets = widget.bodyExecutor.getWidgets();

  const deleteHandler = () => {
    widget.getExecutor().deleteWidget(widget.id); 
  };

  return (
    <WidgetWrapper onDelete={deleteHandler} onSettings={() => { console.log("settings"); }}>
      <div className="font-mono">
        {/* Header: if (condition) */}
        <div className="flex items-center gap-1">
          <span className="text-purple-600 font-semibold">if</span>
          <span className="text-gray-600">(</span>
          {!widget.slots.conditionSlot && (
            <DroppableSlot
              id={`${widget.id}-conditionSlot`}
              slotName="conditionSlot"
              widgetId={widget.id}
              accepts={[WidgetRoles.EXPRESSION]}
              executor={widget.executor}
            >
              condition
            </DroppableSlot>
          )}
          {widget.slots.conditionSlot && (
            <div className="flex items-center justify-center pl-2 pr-2 rounded-md border border-gray-300">
              {widget.slots.conditionSlot.render()}
            </div>
          )}
          <span className="text-gray-600">)</span>
        </div>

        {/* Body: { content } - Droppable canvas for statement widgets */}
        <div className="text-gray-600">{`{`}</div>
        <div className="ml-4 min-h-16">
          <DroppableCanvas id={widget.getBodyCanvasId()} executor={widget.bodyExecutor}>
            <SortableContext
              items={bodyWidgets.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              {bodyWidgets.length === 0 ? (
                <div className="text-gray-400 text-sm">Drop widget here</div>
              ) : (
                bodyWidgets.map((w) => (
                  <SortableItem
                    key={w.id}
                    id={w.id}
                    executor={widget.bodyExecutor}
                  >
                    {w.render()}
                  </SortableItem>
                ))
              )}
            </SortableContext>
          </DroppableCanvas>
        </div>
        <div className="text-gray-600">{`}`}</div>
      </div>
    </WidgetWrapper>
  );
};

export default IfComponent;