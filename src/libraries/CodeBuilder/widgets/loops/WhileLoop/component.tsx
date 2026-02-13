import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { DroppableBody } from "../../../../../components/DroppableBody";
import { WidgetRoles } from "../../../../../utils/constants";
import type { WhileLoopWidget } from "./WhileLoop";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";

const WhileLoopComponent = ({ widget }: { widget: WhileLoopWidget }) => {
  const bodyWidgets = widget.bodyExecutor.getWidgets();

  const deleteHandler = () => {
    widget.getExecutor().deleteWidget(widget.id);
  };

  return (
    <WidgetWrapper onDelete={deleteHandler}>
      <div>
        {/* Header: while (condition) */}
        <div className="flex items-center gap-1">
          <span className="text-brown-light">While (</span>
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

        {/* Body: { content } */}
        <div className="text-brown-light">{`{`}</div>
        <div className="ml-4 min-h-16 border-l-2 border-dashed pl-2 text-secondary-color">
          <DroppableBody
            id={widget.getBodyCanvasId()}
            executor={widget.bodyExecutor}
            widgets={bodyWidgets}
          />
        </div>
        <div className="text-brown-light">{`}`}</div>
      </div>
    </WidgetWrapper>
  );
};

export default WhileLoopComponent;
