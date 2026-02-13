import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { DroppableBody } from "../../../../../components/DroppableBody";
import { WidgetRoles } from "../../../../../utils/constants";
import type { RepeatNWidget } from "./RepeatN";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";

const RepeatNComponent = ({ widget }: { widget: RepeatNWidget }) => {
  const bodyWidgets = widget.bodyExecutor.getWidgets();

  const deleteHandler = () => {
    widget.getExecutor().deleteWidget(widget.id);
  };

  return (
    <WidgetWrapper onDelete={deleteHandler}>
      <div>
        {/* Header: Repeat N (N = count slot) */}
        <div className="flex items-center gap-1">
          <span className="text-brown-light">Repeat</span>
          {!widget.slots.countSlot && (
            <DroppableSlot
              id={`${widget.id}-countSlot`}
              slotName="countSlot"
              widgetId={widget.id}
              accepts={[WidgetRoles.EXPRESSION]}
              executor={widget.executor}
            >
              N
            </DroppableSlot>
          )}
          {widget.slots.countSlot && (
            <div className="flex items-center">
              {widget.slots.countSlot.render()}
            </div>
          )}
          <span className="text-brown-light"> times</span>
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

export default RepeatNComponent;
