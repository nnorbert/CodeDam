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

    const style: React.CSSProperties = {
        flexShrink: 0,
        transform: CSS.Transform.toString(transform),
        transition:
            transition && transition.includes("0ms")
                ? "transform 200ms ease"
                : transition ?? "transform 200ms ease",
        minHeight: "60px",
        width: "fit-content",
        zIndex: isDragging ? 50 : "auto",
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
            style={style}
            {...attributes}
            {...listeners}
            className={`p-3 bg-green-200 rounded shadow cursor-move transition-colors box-border flex flex-col items-start justify-center ${shadow}`}
        >
            {children}
        </div>
    );
}

export default SortableItem;
