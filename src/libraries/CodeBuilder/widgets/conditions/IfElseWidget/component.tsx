import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { DroppableBody } from "../../../../../components/DroppableBody";
import { WidgetRoles } from "../../../../../utils/constants";
import type { IfElseWidget } from "./IfElseWidget";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";

const IfElseComponent = ({ widget }: { widget: IfElseWidget }) => {
  const thenWidgets = widget.thenExecutor.getWidgets();
  const elseWidgets = widget.elseExecutor.getWidgets();

  const deleteHandler = () => {
    widget.getExecutor().deleteWidget(widget.id); 
  };

  return (
    <WidgetWrapper onDelete={deleteHandler}>
      <div className="font-mono">
        {/* Header: if (condition) */}
        <div className="flex items-center gap-1">
          <span className="text-purple-800 font-bold">if</span>
          <span className="text-amber-700">(</span>
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
            <div className="flex items-center">
              {widget.slots.conditionSlot.render()}
            </div>
          )}
          <span className="text-amber-700">)</span>
        </div>

        {/* "Then" Body: { content } - Droppable canvas for statement widgets */}
        <div className="text-amber-700 font-bold">{`{`}</div>
        <div className="ml-4 min-h-16 border-l-2 border-dashed border-amber-400/50 pl-2">
          <DroppableBody
            id={widget.getThenCanvasId()}
            executor={widget.thenExecutor}
            widgets={thenWidgets}
          />
        </div>
        <div className="text-amber-700 font-bold">{`}`}</div>

        {/* Else keyword */}
        <div className="flex items-center gap-1">
          <span className="text-purple-800 font-bold">else</span>
        </div>

        {/* "Else" Body: { content } - Droppable canvas for statement widgets */}
        <div className="text-amber-700 font-bold">{`{`}</div>
        <div className="ml-4 min-h-16 border-l-2 border-dashed border-amber-400/50 pl-2">
          <DroppableBody
            id={widget.getElseCanvasId()}
            executor={widget.elseExecutor}
            widgets={elseWidgets}
          />
        </div>
        <div className="text-amber-700 font-bold">{`}`}</div>
      </div>
    </WidgetWrapper>
  );
};

export default IfElseComponent;
