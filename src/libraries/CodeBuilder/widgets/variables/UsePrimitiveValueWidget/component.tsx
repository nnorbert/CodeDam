import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { UsePrimitiveValueWidget } from "./UsePrimitiveValueWidget";

// Format value for display
function formatValue(value: string | number | boolean | null | undefined): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (value === "") return '""';
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
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
      <div className="flex items-center justify-center font-mono text-sm">
        {formatValue(value)}
      </div>
    </WidgetWrapper>
  );
};

export default UsePrimitiveValueComponent;