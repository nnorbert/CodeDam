import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetRoles } from "../../../../../utils/constants";
import { CreateVarWidget } from "./CreateVarWidget";

const CreaveVarComponent = ({ widget }: { widget: CreateVarWidget }) => {
    return (
      <div className="flex items-center gap-1 font-medium">
        <span className="text-indigo-600">{widget.getName() || "unnamed"}</span>
        <span className="text-gray-500">=</span>
        <DroppableSlot id={`slot-${widget.id}`} accepts={[WidgetRoles.EXPRESSION]}>
          TEST
        </DroppableSlot>
      </div>
    );
  };
  
  export default CreaveVarComponent;