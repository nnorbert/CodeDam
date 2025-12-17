import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import type { UsePrimitiveValueWidget } from "./UsePrimitiveValueWidget";



const UsePrimitiveValueComponent = ({ widget, value }: { widget: UsePrimitiveValueWidget, value: string | number | boolean | null }) => {
  const deleteHandler = () => {
    widget.getExecutor().deleteWidget(widget.id);
  };

  return (
    <WidgetWrapper onDelete={deleteHandler} onSettings={() => { console.log("settings"); }}>
      <div className="flex items-center justify-center">
        {value ?? "null"}
      </div>
    </WidgetWrapper>
  );
};

export default UsePrimitiveValueComponent;