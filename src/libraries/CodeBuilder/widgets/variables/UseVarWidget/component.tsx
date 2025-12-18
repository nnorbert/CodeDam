import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { UseVarWidget } from "./UseVarWidget";

const UseVarComponent = ({ widget }: { widget: UseVarWidget }) => {

  const deleteHandler = () => {
    widget.getExecutor().deleteWidget(widget.id); 
  };

  const settingsHandler = async () => {
    const changed = await widget.openConfig();
    if (changed) {
      widget.getExecutor().notifyChange();
    }
  };

  const variableName = widget.getVariableName();

  return (
    <WidgetWrapper onDelete={deleteHandler} onSettings={settingsHandler}>
      <div className="font-mono text-sm">
        {variableName || <span className="text-gray-400 italic">no variable</span>}
      </div>
    </WidgetWrapper>
  );
};

export default UseVarComponent;
