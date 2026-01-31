import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { TextLengthWidget } from "./TextLengthWidget";

const TextLengthComponent = ({ widget }: { widget: TextLengthWidget }) => {
    const deleteHandler = () => {
        widget.getExecutor().deleteWidget(widget.id);
    };

    return (
        <WidgetWrapper onDelete={deleteHandler} role={WidgetRoles.EXPRESSION}>
            <div className="flex items-center gap-1">
                <span className="text-green-dark">Len(</span>
                {!widget.slots.textInput && (
                    <DroppableSlot
                        id={`${widget.id}-textInput`}
                        slotName="textInput"
                        widgetId={widget.id}
                        accepts={[WidgetRoles.EXPRESSION]}
                        executor={widget.executor}
                    >
                        text
                    </DroppableSlot>
                )}
                {widget.slots.textInput && (
                    <div className="flex items-center">
                        {widget.slots.textInput.render()}
                    </div>
                )}
                <span className="text-green-dark">)</span>
            </div>
        </WidgetWrapper>
    );
};

export default TextLengthComponent;

