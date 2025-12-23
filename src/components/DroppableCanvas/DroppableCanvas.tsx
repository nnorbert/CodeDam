import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";
import { DroppableTypes, WidgetRoles } from "../../utils/constants";
import type { Executor } from "../../libraries/CodeBuilder/Executor";
import { useDragContext } from "../../contexts/DragContext";

type Props = PropsWithChildren<{
  id: string;
  executor: Executor;
}>;

const DroppableCanvas = (props: Props) => {
  const accepts = [WidgetRoles.STATEMENT];
  const { isEditingLocked } = useDragContext();
  const { children } = props;
  const { setNodeRef, isOver, active } = useDroppable({
    id: props.id,
    disabled: isEditingLocked,
    data: {
      isContainer: true,
      type: DroppableTypes.CANVAS,
      accepts,
      executor: props.executor,
    },
  });

  const canAccept = !isEditingLocked && accepts.includes(active?.data.current?.role);

  return (
    <div
      ref={setNodeRef}
      className={[
        "canvas-water border-2 p-4 rounded-lg flex flex-col transition-all duration-200",
        canAccept ? "border-green-400 shadow-lg shadow-green-200/50" : "border-amber-300/50",
        isOver && canAccept ? "bg-green-50/50" : ""
      ].join(" ")}
      style={{
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div className="flex-1 overflow-y-auto flex flex-col pr-2 pl-2">
        {children}
      </div>
    </div>
  );
}

export default DroppableCanvas;
