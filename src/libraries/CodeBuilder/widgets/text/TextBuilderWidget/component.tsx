import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { TextBuilderWidget } from "./TextBuilderWidget";

const TextBuilderComponent = ({ widget }: { widget: TextBuilderWidget }) => {
    const deleteHandler = () => {
        widget.getExecutor().deleteWidget(widget.id);
    };

    const settingsHandler = async () => {
        const changed = await widget.openConfig();
        if (changed) {
            widget.getExecutor().notifyChange();
        }
    };

    const renderSlots = () => {
        const elements: React.ReactNode[] = [];
        
        for (let i = 0; i < widget.componentCount; i++) {
            const slotKey = `component${i}`;
            const slot = widget.slots[slotKey];

            // Add separator (+ or space indicator) between slots
            if (i > 0) {
                elements.push(
                    <span key={`sep-${i}`} className="text-teal-700 font-bold px-1">
                        {widget.addSpaces ? "⌴" : "+"}
                    </span>
                );
            }

            if (!slot) {
                elements.push(
                    <DroppableSlot
                        key={`slot-${i}`}
                        id={`${widget.id}-${slotKey}`}
                        slotName={slotKey}
                        widgetId={widget.id}
                        accepts={[WidgetRoles.EXPRESSION]}
                        executor={widget.executor}
                    >
                        text {i + 1}
                    </DroppableSlot>
                );
            } else {
                elements.push(
                    <div key={`slot-${i}`} className="flex items-center">
                        {slot.render()}
                    </div>
                );
            }
        }

        return elements;
    };

    return (
        <WidgetWrapper onDelete={deleteHandler} onSettings={settingsHandler} role={WidgetRoles.EXPRESSION}>
            <div className="font-mono text-sm flex items-center gap-1 flex-wrap">
                <span className="text-teal-800 font-bold mr-1">📝</span>
                {renderSlots()}
            </div>
        </WidgetWrapper>
    );
};

export default TextBuilderComponent;

