import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";
import { DroppableTypes, WidgetRoles } from "../../utils/constants";
import type { Executor } from "../../libraries/CodeBuilder/Executor";

type Props = PropsWithChildren<{
  id: string;
  executor: Executor;
}>;

const DroppableCanvas = (props: Props) => {
  const accepts = [WidgetRoles.STATEMENT];
    const { children } = props;
    const { setNodeRef, isOver, active } = useDroppable({
      id: props.id,
      data: {
        isContainer: true,
        type: DroppableTypes.CANVAS,
        accepts,
        executor: props.executor,
      },
    });

    const canAccept = accepts.includes(active?.data.current?.role);

    return (
      <div
        ref={setNodeRef}
        className={["border p-4 rounded flex flex-col",
          canAccept ? "border-blue-400" : "border-gray-300",
          isOver && canAccept ? "bg-blue-50" : "bg-white"
        ].join(" ")}
        style={{
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
          {children}
        </div>
      </div>
    );
}

export default DroppableCanvas;
