import { confirmationModal } from "../../../../../components/ConfirmationModal";
import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import { CreateConstWidget } from "./CreateConstWidget";

const CreaveConstComponent = ({ widget }: { widget: CreateConstWidget }) => {
  const deleteHandler = async () => {
    const executor = widget.getExecutor();
    const { inUse, usageCount } = executor.isVariableInUse(widget.id);

    if (inUse) {
      // Show error message - variable is in use
      await confirmationModal.confirm("Cannot Delete Variable", {
        message: `This variable "${widget.getName()}" is being used in ${usageCount} place${usageCount > 1 ? 's' : ''}. Remove all usages before deleting.`,
        confirmLabel: "OK",
        cancelLabel: "Cancel",
        variant: "warning",
      });
      return;
    }

    executor.deleteWidget(widget.id); 
  };

  const settingsHandler = async () => {
    const changed = await widget.openConfig();
    if (changed) {
      widget.getExecutor().notifyChange();
    }
  };

  return (
    <WidgetWrapper onDelete={deleteHandler} onSettings={settingsHandler}>
      <div className="flex items-center gap-2">
        <span>Const</span>
        <span className="text-blue-light">{widget.getName() || "unnamed"}</span>
        <span>=</span>
        {!widget.slots.valueSlot && (
          <DroppableSlot
            id={`${widget.id}-valueSlot`}
            slotName="valueSlot"
            widgetId={widget.id}
            accepts={[WidgetRoles.EXPRESSION]}
            executor={widget.executor}
          >
            value
          </DroppableSlot>
        )}
        {widget.slots.valueSlot && (
          <div className="flex items-center">
            {widget.slots.valueSlot.render()}
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
};

export default CreaveConstComponent;