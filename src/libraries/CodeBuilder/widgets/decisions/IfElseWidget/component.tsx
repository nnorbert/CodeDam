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
      <div>
        {/* Header: if (condition) */}
        <div className="flex items-center gap-1">
          <span className="text-brown-light">If (</span>
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
          <span className="text-brown-light">)</span>
        </div>

        {/* "Then" Body: { content } - Droppable canvas for statement widgets */}
        <div className="text-brown-light">{`{`}</div>
        <div className="ml-4 min-h-16 border-l-2 border-dashed pl-2 text-secondary-color">
          <DroppableBody
            id={widget.getThenCanvasId()}
            executor={widget.thenExecutor}
            widgets={thenWidgets}
          />
        </div>
        <div className="text-brown-light">{`}`}</div>

        {/* Else keyword */}
        <div className="flex items-center gap-1">
          <span className="text-brown-light">Else</span>
        </div>

        {/* "Else" Body: { content } - Droppable canvas for statement widgets */}
        <div className="text-brown-light">{`{`}</div>
        <div className="ml-4 min-h-16 border-l-2 border-dashed pl-2 text-secondary-color">
          <DroppableBody
            id={widget.getElseCanvasId()}
            executor={widget.elseExecutor}
            widgets={elseWidgets}
          />
        </div>
        <div className="text-brown-light">{`}`}</div>
      </div>
    </WidgetWrapper>
  );
};

export default IfElseComponent;

