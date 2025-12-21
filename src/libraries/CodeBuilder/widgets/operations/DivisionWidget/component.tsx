import DroppableSlot from "../../../../../components/DroppableSlot/DroppableSlot";
import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { DivisionWidget } from "./DivisionWidget";

const DivisionComponent = ({ widget }: { widget: DivisionWidget }) => {
    const deleteHandler = () => {
        widget.getExecutor().deleteWidget(widget.id);
    };

    return (
        <WidgetWrapper onDelete={deleteHandler}>
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
                    <div className="flex items-center justify-center pl-2 pr-2 rounded-md border border-gray-300">
                        {widget.slots.leftOperand.render()}
                    </div>
                )}

                <span className="text-blue-600 font-bold px-1">÷</span>

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
                    <div className="flex items-center justify-center pl-2 pr-2 rounded-md border border-gray-300">
                        {widget.slots.rightOperand.render()}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};

export default DivisionComponent;

