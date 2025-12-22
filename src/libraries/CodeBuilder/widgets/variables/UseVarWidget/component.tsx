import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
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
    <WidgetWrapper onDelete={deleteHandler} onSettings={settingsHandler} role={WidgetRoles.EXPRESSION}>
      <div className="font-mono text-sm">
        {variableName || <span className="text-amber-600/60 italic">no variable</span>}
      </div>
    </WidgetWrapper>
  );
};

export default UseVarComponent;
