import { DroppableTypes, type WidgetRoleType } from "../../utils/constants";
import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";
import type { Executor } from "../../libraries/CodeBuilder/Executor";

type Props = PropsWithChildren<{
    /** Slot name (e.g., "conditionSlot") - will be combined with widgetId for unique droppable ID */
    id: string;
    accepts: WidgetRoleType[];
    executor: Executor;
    widgetId: string;
}>;

const DroppableSlot = (props: Props) => {
    // Create a unique droppable ID by combining widgetId and slot name
    const uniqueDroppableId = `${props.widgetId}-${props.id}`;

    const { setNodeRef, isOver, active } = useDroppable({
        id: uniqueDroppableId,
        data: {
            isContainer: true,
            type: DroppableTypes.SLOT,
            accepts: props.accepts,
            widgetId: props.widgetId,
            // Store the original slot name for registration
            slotName: props.id,
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