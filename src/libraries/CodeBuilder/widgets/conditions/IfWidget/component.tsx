import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetRoles } from "../../../../../utils/constants";
import type { IfWidget } from "./IfWidget";

const IfComponent = ({ widget }: { widget: IfWidget }) => {
  return (
    <div className="font-mono">
      {/* Header: if (condition) */}
      <div className="flex items-center gap-1">
        <span className="text-purple-600 font-semibold">if</span>
        <span className="text-gray-600">(</span>
        {!widget.slots.conditionSlot && (
          <DroppableSlot
            id="conditionSlot"
            widgetId={widget.id}
            accepts={[WidgetRoles.EXPRESSION]}
            executor={widget.executor}
          >
            condition
          </DroppableSlot>
        )}
        {widget.slots.conditionSlot && widget.slots.conditionSlot.render()}
        <span className="text-gray-600">)</span>
      </div>

      {/* Body: { content } */}
      <div className="text-gray-600">{`{`}</div>
      <div className="ml-4 min-h-16 border-2 border-dashed border-gray-300 rounded bg-gray-50/50"></div>
      <div className="text-gray-600">{`}`}</div>
    </div>
  );
};

export default IfComponent;