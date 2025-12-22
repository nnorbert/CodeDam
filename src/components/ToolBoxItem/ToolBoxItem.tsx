import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { GenericWidgetBase } from "../../libraries/CodeBuilder/baseClasses/GenericWidgetBase";
import { useDragContext } from "../../contexts/DragContext";
import { WidgetRoles } from "../../utils/constants";

export type ToolboxItemData = typeof GenericWidgetBase;

type Props = {
  widget: ToolboxItemData;
  disabled?: boolean;
}

const ToolBoxItem = ({ widget, disabled }: Props) => {
  const { isEditingLocked } = useDragContext();
  const isDisabled = disabled || isEditingLocked;
  const role = widget.getRole();
  const isStatement = role === WidgetRoles.STATEMENT;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `tool-${widget.getType()}`,
      disabled: isDisabled,
      data: {
        type: widget.getType(),
        isToolboxItem: true,
        className: widget,
        role: role,
      },
    });

  const style: React.CSSProperties = {
    transform: disabled ? CSS.Translate.toString(transform) : undefined,
    opacity: disabled ? 1 : isDragging ? 0.5 : isEditingLocked ? 0.5 : 1,
  };

  // Different styles for statement (plank) vs expression (slice)
  const itemClasses = isStatement
    ? "toolbox-item-statement w-[72px] h-16 flex items-center justify-center text-center text-xs font-semibold"
    : "toolbox-item-expression w-16 h-16 flex items-center justify-center text-center text-xs font-semibold";

  return (
    <div
      ref={isDisabled ? undefined : setNodeRef}
      style={style}
      {...(!isDisabled ? attributes : {})}
      {...(!isDisabled ? listeners : {})}
      className={`${itemClasses} ${isEditingLocked ? 'cursor-not-allowed opacity-60' : 'cursor-grab hover:scale-105 transition-transform'}`}
    >
      {widget.getToolboxItemElement()}
    </div>
  );
}

export default ToolBoxItem;
