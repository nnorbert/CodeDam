import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { UserOutputWidget } from "./UserOutputWidget";

const UserOutputComponent = ({ widget }: { widget: UserOutputWidget }) => {
    const deleteHandler = () => {
        widget.getExecutor().deleteWidget(widget.id);
    };

    return (
        <WidgetWrapper onDelete={deleteHandler}>
            <div>
                <div className="flex items-center gap-1">
                    <span>alert</span>
                    <span>(</span>
                    {!widget.slots.valueSlot && (
                        <DroppableSlot
                            id={`${widget.id}-valueSlot`}
                            slotName="valueSlot"
                            widgetId={widget.id}
                            accepts={[WidgetRoles.EXPRESSION]}
                            executor={widget.executor}
                        >
                            value
                        </DroppableSlot>
                    )}
                    {widget.slots.valueSlot && (
                        <div className="flex items-center">
                            {widget.slots.valueSlot.render()}
                        </div>
                    )}
                    <span>)</span>
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default UserOutputComponent;

