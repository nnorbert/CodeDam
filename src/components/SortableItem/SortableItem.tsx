import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PropsWithChildren } from "react";
import { useDragContext } from "../../contexts/DragContext";
import type { Executor } from "../../libraries/CodeBuilder/Executor";
import { WidgetRoles } from "../../utils/constants";

type Props = PropsWithChildren<{
    id: string;
    executor: Executor;
    inExecution: boolean;
}>;

const SortableItem = (props: Props) => {
    const { id, children, executor, inExecution } = props;
    const { activeOverId, overPosition, isToolboxDrag, isEditingLocked } = useDragContext();

    const { attributes, listeners, setNodeRef, transform, transition, isDragging, active } =
        useSortable({
            id,
            disabled: isEditingLocked,
            data: {
                isSortableItem: true,
                executor: executor,
            }
        });

    // Calculate activeRegion from context - only show shadow if this item is being hovered
    const activeRegion = isToolboxDrag && activeOverId === id ? overPosition : null;

    // Outer wrapper style - includes padding for spacing (no gap needed in parent)
    const wrapperStyle: React.CSSProperties = {
        flexShrink: 0,
        transform: CSS.Transform.toString(transform),
        transition:
            transition && transition.includes("0ms")
                ? "transform 200ms ease"
                : transition ?? "transform 200ms ease",
        zIndex: isDragging ? 50 : "auto",
        // Padding creates visual gap but remains part of this element's hit area
        paddingTop: "4px",
        paddingBottom: "4px",
        // Prevent browser handling touch gestures on sortable items
        touchAction: isEditingLocked ? "auto" : "none",
    };

    // Inner content style
    const contentStyle: React.CSSProperties = {
        width: "fit-content",
        outline: isDragging ? "3px solid rgba(139,115,85,0.9)" : "none",
        borderRadius: "8px",
    };

    // Drag indicator shadow (green for wood theme)
    const dragShadow = active?.data.current?.role === WidgetRoles.STATEMENT ? (
        activeRegion === "top"
            ? "shadow-[0_-4px_8px_rgba(124,179,66,0.7)]"
            : activeRegion === "bottom"
                ? "shadow-[0_4px_8px_rgba(124,179,66,0.7)]"
                : ""
    ) : "";

    // Execution highlight shadow (golden glow)
    const executionShadow = inExecution
        ? "shadow-[0_0_0_3px_rgba(251,191,36,0.9),0_0_16px_rgba(251,191,36,0.7)]"
        : "";

    // Combine shadows - execution shadow takes priority
    const shadow = executionShadow || dragShadow;

    return (
        <div
            ref={setNodeRef}
            style={wrapperStyle}
            {...attributes}
            {...(isEditingLocked ? {} : listeners)}
            className={isEditingLocked ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        >
            <div
                style={contentStyle}
                className={`transition-all duration-200 ${shadow}`}
            >
                {children}
            </div>
        </div>
    );
}

export default SortableItem;
