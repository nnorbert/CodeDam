import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PropsWithChildren } from "react";
import type { Executor } from "../../libraries/CodeBuilder/Executor";
import { WidgetRoles } from "../../utils/constants";

type Props = PropsWithChildren<{
    id: string;
    activeRegion?: string | null;
    executor: Executor;
}>;

const SortableItem = (props: Props) => {
    const { id, activeRegion, children, executor } = props;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging, active } =
        useSortable({
            id, data: {
                isSortableItem: true,
                executor: executor,
            }
        });

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
    };

    // Inner content style
    const contentStyle: React.CSSProperties = {
        minHeight: "60px",
        width: "fit-content",
        outline: isDragging ? "3px solid rgba(99,102,241,0.9)" : "none",
    };

    const shadow = active?.data.current?.role === WidgetRoles.STATEMENT ? (
        activeRegion === "top"
            ? "shadow-[0_-4px_6px_rgba(59,130,246,0.6)]"
            : activeRegion === "bottom"
                ? "shadow-[0_4px_6px_rgba(59,130,246,0.6)]"
                : ""
    ) : "";

    return (
        <div
            ref={setNodeRef}
            style={wrapperStyle}
            {...attributes}
            {...listeners}
            className="cursor-move"
        >
            <div
                style={contentStyle}
                className={`p-3 bg-green-200 rounded shadow transition-colors box-border flex flex-col items-start justify-center ${shadow}`}
            >
                {children}
            </div>
        </div>
    );
}

export default SortableItem;
