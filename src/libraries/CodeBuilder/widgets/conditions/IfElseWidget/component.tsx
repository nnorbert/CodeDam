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

        {/* "Then" Body: { content } - Droppable canvas for statement widgets */}
        <div className="text-gray-600">{`{`}</div>
        <div className="ml-4 min-h-16">
          <DroppableBody
            id={widget.getThenCanvasId()}
            executor={widget.thenExecutor}
            widgets={thenWidgets}
          />
        </div>
        <div className="text-gray-600">{`}`}</div>

        {/* Else keyword */}
        <div className="flex items-center gap-1">
          <span className="text-purple-600 font-semibold">else</span>
        </div>

        {/* "Else" Body: { content } - Droppable canvas for statement widgets */}
        <div className="text-gray-600">{`{`}</div>
        <div className="ml-4 min-h-16">
          <DroppableBody
            id={widget.getElseCanvasId()}
            executor={widget.elseExecutor}
            widgets={elseWidgets}
          />
        </div>
        <div className="text-gray-600">{`}`}</div>
      </div>
    </WidgetWrapper>
  );
};

export default IfElseComponent;
