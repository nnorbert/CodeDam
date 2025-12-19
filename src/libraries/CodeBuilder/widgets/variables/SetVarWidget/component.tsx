import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import { SetVarWidget } from "./SetVarWidget";

const SetVarComponent = ({ widget }: { widget: SetVarWidget }) => {

  const deleteHandler = () => {
    widget.getExecutor().deleteWidget(widget.id); 
  };

  const settingsHandler = async () => {
    const changed = await widget.openConfig();
    if (changed) {
      widget.getExecutor().notifyChange();
    }
  };

  const variableName = widget.getTargetVariableName();

  return (
    <WidgetWrapper onDelete={deleteHandler} onSettings={settingsHandler}>
      <div className="flex items-center gap-1 font-medium">
        <span className="text-indigo-600">{variableName || "not set"}</span>
        <span className="text-gray-500">=</span>
        {!widget.slots.valueSlot && (
          <DroppableSlot
            id={`${widget.id}-valueSlot`}
            slotName="valueSlot"
            widgetId={widget.id}
            accepts={[WidgetRoles.EXPRESSION]}
            executor={widget.executor}
          >
            value
          </DroppableSlot>
        )}
        {widget.slots.valueSlot && (
          <div className="flex items-center justify-center pl-2 pr-2 rounded-md border border-gray-300">
            {widget.slots.valueSlot.render()}
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
};

export default SetVarComponent;
