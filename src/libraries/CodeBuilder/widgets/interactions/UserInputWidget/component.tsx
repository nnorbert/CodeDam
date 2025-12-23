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
            <div className="font-mono text-sm flex items-center gap-1">
                <span className="text-purple-600">📥</span>
                <span className="text-amber-800 font-semibold">input</span>
                <span className="text-gray-500 text-xs truncate max-w-24" title={widget.getTitle()}>
                    "{widget.getTitle()}"
                </span>
            </div>
        </WidgetWrapper>
    );
};

export default UserInputComponent;

