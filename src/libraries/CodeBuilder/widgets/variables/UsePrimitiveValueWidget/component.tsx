import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import type { UsePrimitiveValueWidget } from "./UsePrimitiveValueWidget";



const UsePrimitiveValueComponent = ({ widget: _widget, value }: { widget: UsePrimitiveValueWidget, value: string | number | boolean | null }) => {
  return (
    <WidgetWrapper onDelete={() => { console.log("delete"); }} onSettings={() => { console.log("settings"); }}>
      <div className="flex items-center justify-center">
        {value ?? "null"}
      </div>
    </WidgetWrapper>
  );
};

export default UsePrimitiveValueComponent;