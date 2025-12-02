import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { GenericWidgetBase } from "../../libraries/CodeBuilder/baseClasses/GenericWidgetBase";

export type ToolboxItemData = {
  type: string;
  category: string;
  label: string;
  className?: typeof GenericWidgetBase;
};

type Props = {
  widget: ToolboxItemData;
  disabled?: boolean;
}

const ToolBoxItem = ({ widget, disabled }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `tool-${widget.type}`,
      disabled,
      data: {
        type: widget.type,
        isToolboxItem: true,
        className: widget.className,
      },
    });

  const style: React.CSSProperties = {
    transform: disabled ? CSS.Translate.toString(transform) : undefined,
    opacity: disabled ? 1 : isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={disabled ? undefined : setNodeRef}
      style={style}
      {...(!disabled ? attributes : {})}
      {...(!disabled ? listeners : {})}
      className="w-20 h-20 m-2 flex items-center justify-center text-center bg-yellow-200 rounded-lg shadow cursor-grab"
    >
      {widget.label}
    </div>
  );
}

export default ToolBoxItem;
