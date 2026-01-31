import { WidgetWrapper } from "../../../../../components/WidgetWrapper";
import { WidgetRoles } from "../../../../../utils/constants";
import type { UserInputWidget } from "./UserInputWidget";

const UserInputComponent = ({ widget }: { widget: UserInputWidget }) => {
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
        <WidgetWrapper onDelete={deleteHandler} onSettings={settingsHandler} role={WidgetRoles.EXPRESSION}>
            <div className="flex items-center gap-1">
                <span className="text-green-dark">Input</span>
                <span title={widget.getTitle()}>
                    <span className="text-main-color">"{widget.getTitle()}"</span>
                </span>                
            </div>
        </WidgetWrapper>
    );
};

export default UserInputComponent;

