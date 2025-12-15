import { DroppableTypes, type WidgetRoleType } from "../../utils/constants";
import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    id: string;
    accepts: WidgetRoleType[];
}>;

const DroppableSlot = (props: Props) => {
    const { setNodeRef, isOver, active } = useDroppable({
        id: props.id,
        data: {
            isContainer: true,
            type: DroppableTypes.SLOT,
            accepts: props.accepts,
        },
    });

    const activeRole = active?.data?.current?.role;
    const canAccept = props.accepts.includes(activeRole);

    return (
        <div
            ref={setNodeRef}
            className={[
                "h-10 w-24 rounded border-2 border-dashed flex items-center justify-center text-xs",
                canAccept ? "border-blue-400" : "border-gray-300",
                isOver && canAccept ? "bg-blue-100" : "bg-white",
            ].join(" ")}
        >
            {props.children}
        </div>
    );
}

export default DroppableSlot;