import { DroppableTypes, type WidgetRoleType } from "../../utils/constants";
import { useDroppable } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";
import type { Executor } from "../../libraries/CodeBuilder/Executor";
import { useDragContext } from "../../contexts/DragContext";
import "./DroppableSlot.scss";

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

    // Build class names for the slot (circular wood slice hole)
    const slotClasses = [
        "droppable-slot",
        "h-8 min-w-24 px-3 flex items-center justify-center text-xs font-medium text-amber-700/70",
        "transition-all duration-200",
        isEditingLocked && "opacity-60",
        canAccept && "can-accept",
        isOver && canAccept && "is-over",
    ].filter(Boolean).join(" ");

    return (
        <div ref={setNodeRef} className={slotClasses}>
            {props.children}
        </div>
    );
}

export default DroppableSlot;