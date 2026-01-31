import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { UsePrimitiveValueWidget } from "./UsePrimitiveValueWidget";

// Format value for display
function formatValue(value: string | number | boolean | null | undefined): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (value === "") return '""';
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return value ? "True" : "False";
  return String(value);
}

function getColor(value: string | number | boolean | null | undefined): string {
  if (value === null) return "text-red-color";
  if (value === undefined) return "text-red-color";
  if (value === "") return "text-red-color";
  if (typeof value === "string") return "text-secondary-color";
  if (typeof value === "number") return "text-green-dark";
  if (typeof value === "boolean") return "text-blue-dark";
  return "text-main-color";
}
const UsePrimitiveValueComponent = ({ widget, value }: { widget: UsePrimitiveValueWidget, value: string | number | boolean | null | undefined }) => {
  const deleteHandler = () => {
    widget.getExecutor().deleteWidget(widget.id);
  };

  const settingsHandler = async () => {
    const changed = await widget.openConfig(true);
    if (changed) {
      widget.getExecutor().notifyChange();
    }
  };

  return (
    <WidgetWrapper onDelete={deleteHandler} onSettings={settingsHandler} role={WidgetRoles.EXPRESSION}>
      <div className="flex items-center justify-center">
        <span className={getColor(value)}>{formatValue(value)}</span>
      </div>
    </WidgetWrapper>
  );
};

export default UsePrimitiveValueComponent;