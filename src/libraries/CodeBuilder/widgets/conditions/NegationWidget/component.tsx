import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { NegationWidget } from "./NegationWidget";

const NegationComponent = ({ widget }: { widget: NegationWidget }) => {
    const deleteHandler = () => {
        widget.getExecutor().deleteWidget(widget.id);
    };

    return (
        <WidgetWrapper onDelete={deleteHandler} role={WidgetRoles.EXPRESSION}>
            <div className="flex items-center gap-1">
                <span className="text-red-color font-size-24 ml-2 mr-2">!</span>

                {!widget.slots.value && (
                    <DroppableSlot
                        id={`${widget.id}-value`}
                        slotName="value"
                        widgetId={widget.id}
                        accepts={[WidgetRoles.EXPRESSION]}
                        executor={widget.executor}
                    >
                        value
                    </DroppableSlot>
                )}
                {widget.slots.value && (
                    <div className="flex items-center">
                        {widget.slots.value.render()}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};

export default NegationComponent;

