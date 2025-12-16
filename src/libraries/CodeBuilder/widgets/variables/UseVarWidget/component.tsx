import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { UseVarWidget } from "./UseVarWidget";


const UseVarComponent = ({ widget }: { widget: UseVarWidget }) => {
    return (
      <WidgetWrapper onDelete={() => { console.log("delete"); }} onSettings={() => { console.log("settings"); }}>
        <div>
          TEST
        </div>
      </WidgetWrapper>
    );
  };
  
  export default UseVarComponent;