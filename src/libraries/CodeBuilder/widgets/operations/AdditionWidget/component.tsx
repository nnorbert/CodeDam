import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { AdditionWidget } from "./AdditionWidget";

const AdditionComponent = ({ widget }: { widget: AdditionWidget }) => {
    const deleteHandler = () => {
        widget.getExecutor().deleteWidget(widget.id);
    };

    return (
        <WidgetWrapper onDelete={deleteHandler} role={WidgetRoles.EXPRESSION}>
            <div className="font-mono text-sm flex items-center gap-1">
                {!widget.slots.leftOperand && (
                    <DroppableSlot
                        id={`${widget.id}-leftOperand`}
                        slotName="leftOperand"
                        widgetId={widget.id}
                        accepts={[WidgetRoles.EXPRESSION]}
                        executor={widget.executor}
                    >
                        left
                    </DroppableSlot>
                )}
                {widget.slots.leftOperand && (
                    <div className="flex items-center">
                        {widget.slots.leftOperand.render()}
                    </div>
                )}

                <span className="text-amber-800 font-bold px-1">+</span>

                {!widget.slots.rightOperand && (
                    <DroppableSlot
                        id={`${widget.id}-rightOperand`}
                        slotName="rightOperand"
                        widgetId={widget.id}
                        accepts={[WidgetRoles.EXPRESSION]}
                        executor={widget.executor}
                    >
                        right
                    </DroppableSlot>
                )}
                {widget.slots.rightOperand && (
                    <div className="flex items-center">
                        {widget.slots.rightOperand.render()}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};

export default AdditionComponent;

