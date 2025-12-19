import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { GenericWidgetBase } from "../../libraries/CodeBuilder/baseClasses/GenericWidgetBase";
import { useDragContext } from "../../contexts/DragContext";

export type ToolboxItemData = typeof GenericWidgetBase;

type Props = {
  widget: ToolboxItemData;
  disabled?: boolean;
}

const ToolBoxItem = ({ widget, disabled }: Props) => {
  const { isEditingLocked } = useDragContext();
  const isDisabled = disabled || isEditingLocked;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `tool-${widget.getType()}`,
      disabled: isDisabled,
      data: {
        type: widget.getType(),
        isToolboxItem: true,
        className: widget,
        role: widget.getRole(),
      },
    });

  const style: React.CSSProperties = {
    transform: disabled ? CSS.Translate.toString(transform) : undefined,
    opacity: disabled ? 1 : isDragging ? 0.5 : isEditingLocked ? 0.5 : 1,
  };

  return (
    <div
      ref={isDisabled ? undefined : setNodeRef}
      style={style}
      {...(!isDisabled ? attributes : {})}
      {...(!isDisabled ? listeners : {})}
      className={`w-20 h-20 m-2 flex items-center justify-center text-center bg-yellow-200 rounded-lg shadow ${isEditingLocked ? 'cursor-not-allowed' : 'cursor-grab'}`}
    >
      {widget.getToolboxItemElement()}
    </div>
  );
}

export default ToolBoxItem;
