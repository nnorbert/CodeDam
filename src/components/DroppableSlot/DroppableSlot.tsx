import { DroppableTypes, type WidgetRoleType } from "../../utils/constants";
import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";
import type { Executor } from "../../libraries/CodeBuilder/Executor";

type Props = PropsWithChildren<{
    id: string;
    accepts: WidgetRoleType[];
    executor: Executor;
    widgetId: string;
}>;

const DroppableSlot = (props: Props) => {
    const { setNodeRef, isOver, active } = useDroppable({
        id: props.id,
        data: {
            isContainer: true,
            type: DroppableTypes.SLOT,
            accepts: props.accepts,
            widgetId: props.widgetId,
            executor: props.executor,
        },
    });

    const activeRole = active?.data?.current?.role;
    const canAccept = props.accepts.includes(activeRole);

    return (
        <div
            ref={setNodeRef}
            className={[
                "h-10 w-32 rounded border-2 border-dashed flex items-center justify-center text-xs",
                canAccept ? "border-blue-400" : "border-gray-300",
                isOver && canAccept ? "bg-blue-100" : "bg-white",
            ].join(" ")}
        >
            {props.children}
        </div>
    );
}

export default DroppableSlot;