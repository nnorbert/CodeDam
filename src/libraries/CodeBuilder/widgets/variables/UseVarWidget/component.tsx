import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { UseVarWidget } from "./UseVarWidget";


const UseVarComponent = ({ widget }: { widget: UseVarWidget }) => {

  const deleteHandler = () => {
    widget.getExecutor().deleteWidget(widget.id); 
  };

  return (
    <WidgetWrapper onDelete={deleteHandler} onSettings={() => { console.log("settings"); }}>
      <div>
        TEST
      </div>
    </WidgetWrapper>
  );
};

export default UseVarComponent;