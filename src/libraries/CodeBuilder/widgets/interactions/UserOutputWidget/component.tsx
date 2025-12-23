import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { UserOutputWidget } from "./UserOutputWidget";

const UserOutputComponent = ({ widget }: { widget: UserOutputWidget }) => {
    const deleteHandler = () => {
        widget.getExecutor().deleteWidget(widget.id);
    };

    const settingsHandler = async () => {
        const changed = await widget.openConfig();
        if (changed) {
            widget.getExecutor().notifyChange();
        }
    };

    return (
        <WidgetWrapper onDelete={deleteHandler} onSettings={settingsHandler}>
            <div className="font-mono text-sm">
                <div className="flex items-center gap-1">
                    <span className="text-purple-600">📤</span>
                    <span className="text-amber-800 font-semibold">output</span>
                    <span className="text-gray-800 text-xs truncate max-w-24" title={widget.getTitle()}>
                        "{widget.getTitle()}"
                    </span>
                </div>
                <div className="flex items-center gap-1 mt-1 ml-5">
                    <span className="text-gray-800 text-xs">value:</span>
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
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default UserOutputComponent;

