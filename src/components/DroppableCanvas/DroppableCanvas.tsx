import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";
import { CANVAS_ID } from "../../utils/constants";

type Props = PropsWithChildren<{
    title: string;
}>;

const DroppableCanvas = (props: Props) => {
    const { title, children } = props;
    const { setNodeRef, isOver } = useDroppable({ id: CANVAS_ID });

    return (
      <div
        ref={setNodeRef}
        className={`border p-4 rounded flex flex-col ${isOver ? "bg-blue-50" : "bg-white"
          }`}
        style={{
          height: "100%",
          overflow: "hidden",
        }}
      >
        <h2 className="font-bold mb-2">{title}</h2>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
          {children}
        </div>
      </div>
    );
}

export default DroppableCanvas;
