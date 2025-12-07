import { CreateVarWidget } from "./CreateVarWidget";

const CreaveVarComponent = ({ widget }: { widget: CreateVarWidget }) => {
    return (
      <div>
        <div className="font-medium text-gray-900">
          Variable: <span className="text-indigo-600">{widget.getName() || "unnamed"}</span>
        </div>
        <div className="text-xs text-gray-500">ID: {widget.id}</div>
      </div>
    );
  };
  
  export default CreaveVarComponent;