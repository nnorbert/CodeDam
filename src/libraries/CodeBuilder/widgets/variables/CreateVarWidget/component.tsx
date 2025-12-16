import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetRoles } from "../../../../../utils/constants";
import { CreateVarWidget } from "./CreateVarWidget";

const CreaveVarComponent = ({ widget }: { widget: CreateVarWidget }) => {
    return (
      <div className="flex items-center gap-1 font-medium">
        <span className="text-indigo-600">let {widget.getName() || "unnamed"}</span>
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
          widget.slots.valueSlot.render()
        )}
      </div>
    );
  };
  
  export default CreaveVarComponent;