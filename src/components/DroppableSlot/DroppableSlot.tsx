import { DroppableTypes, type WidgetRoleType } from "../../utils/constants";
import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";
import type { Executor } from "../../libraries/CodeBuilder/Executor";
import { useDragContext } from "../../contexts/DragContext";

type Props = PropsWithChildren<{
    id: string;
    slotName: string;
    accepts: WidgetRoleType[];
    executor: Executor;
    widgetId: string;
}>;

const DroppableSlot = (props: Props) => {
    const { isEditingLocked } = useDragContext();

    const { setNodeRef, isOver, active } = useDroppable({
        id: props.id,
        disabled: isEditingLocked,
        data: {
            isContainer: true,
            type: DroppableTypes.SLOT,
            accepts: props.accepts,
            widgetId: props.widgetId,
            slotName: props.slotName,
            executor: props.executor,
        },
    });

    const activeRole = active?.data?.current?.role;
    const canAccept = !isEditingLocked && props.accepts.includes(activeRole);

    return (
        <div
            ref={setNodeRef}
            className={[
                "h-10 w-32 rounded border-2 border-dashed flex items-center justify-center text-xs",
                isEditingLocked ? "border-gray-200 opacity-60" : canAccept ? "border-blue-400" : "border-gray-300",
                isOver && canAccept ? "bg-blue-100" : "bg-white",
            ].join(" ")}
        >
            {props.children}
        </div>
    );
}

export default DroppableSlot;