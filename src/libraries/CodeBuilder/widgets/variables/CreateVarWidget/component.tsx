import { CreateVarWidget } from "./CreateVarWidget";

const CreaveVarComponent = ({ widget }: { widget: CreateVarWidget }) => {
    return (
      <div>
        {`Name: ${CreateVarWidget.getType()}`}
        <br />
        {`ID: ${widget.id}`}
      </div>
    );
  };
  
  export default CreaveVarComponent;