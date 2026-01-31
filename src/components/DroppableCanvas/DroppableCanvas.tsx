import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";
import { DroppableTypes, WidgetRoles } from "../../utils/constants";
import type { Executor } from "../../libraries/CodeBuilder/Executor";
import { useDragContext } from "../../contexts/DragContext";
import "./DroppableCanvas.scss";

type Props = PropsWithChildren<{
  id: string;
  executor: Executor;
  isNested?: boolean;
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
        "droppable-canvas-area",
        props.isNested ? "nested" : "",
        "flex flex-col transition-all duration-200",
        canAccept ? "can-accept" : "",
        isOver && canAccept ? "is-over" : ""
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
