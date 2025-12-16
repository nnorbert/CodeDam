import type { UsePrimitiveValueWidget } from "./UsePrimitiveValueWidget";



const UsePrimitiveValueComponent = ({ widget: _widget, value }: { widget: UsePrimitiveValueWidget, value: string | number | boolean | null }) => {
  return (
    <div>
      {value ?? "null"}
    </div>
  );
};

export default UsePrimitiveValueComponent;