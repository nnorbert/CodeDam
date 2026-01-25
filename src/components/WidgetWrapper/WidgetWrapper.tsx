import type { PropsWithChildren } from "react";
import { EllipsisVerticalIcon, Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { confirmationModal } from "../ConfirmationModal";
import { useDragContext } from "../../contexts/DragContext";
import { WidgetRoles, type WidgetRoleType } from "../../utils/constants";
import "./WidgetWrapper.scss";

type Props = PropsWithChildren<{
    onDelete: () => void;
    onSettings?: () => void;
    role?: WidgetRoleType;
}>;

const WidgetWrapper = ({ children, onDelete, onSettings, role = WidgetRoles.STATEMENT }: Props) => {
    const { isEditingLocked } = useDragContext();
    const isStatement = role === WidgetRoles.STATEMENT;

    const handleDelete = async () => {
        if (isEditingLocked) return;
        
        const confirmed = await confirmationModal.confirm("Delete Widget", {
            message: "Are you sure you want to delete this widget?",
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            variant: "danger",
        });
        if (confirmed) {
            onDelete();
        }
    };

    const handleSettings = () => {
        if (isEditingLocked || !onSettings) return;
        onSettings();
    };

    // Prevent drag from starting when clicking the menu
    const stopDrag = (e: React.PointerEvent | React.MouseEvent) => {
        e.stopPropagation();
    };

    // Wrapper classes based on role
    const wrapperClasses = isStatement 
        ? "wood-plank" 
        : "wood-slice";

    // Menu button styling - needs contrast against wood background
    const menuButtonClasses = isStatement
        ? "widget-menu-button text-amber-100 hover:text-white hover:bg-amber-900/30 transition-colors cursor-pointer p-1 rounded"
        : "widget-menu-button text-amber-800 hover:text-amber-950 hover:bg-amber-900/20 transition-colors cursor-pointer p-1 rounded";

    return (
        <div className={
            [
                'widget-wrapper',
                isStatement ? "statement-wrapper" : "expression-wrapper",
                wrapperClasses,
                'flex flex-row items-start gap-1'
            ].join(" ")
        }>
            <div className="flex-1 self-center">{children}</div>
            {!isEditingLocked && (
                <Menu as="div" className="widget-menu-wrapper relative self-start mt-1">
                    <MenuButton
                        className={menuButtonClasses}
                        onPointerDown={stopDrag}
                        onMouseDown={stopDrag}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EllipsisVerticalIcon className="w-4 h-4" />
                    </MenuButton>
                    <MenuItems
                        anchor="bottom end"
                        className="absolute right-0 mt-1 w-32 origin-top-right rounded-md bg-amber-50 shadow-lg ring-1 ring-amber-900/10 focus:outline-none z-50 border border-amber-200"
                        onPointerDown={stopDrag}
                        onMouseDown={stopDrag}
                    >
                        {onSettings && (
                        <MenuItem>
                            <button
                                type="button"
                                onPointerDown={stopDrag}
                                onMouseDown={stopDrag}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSettings();
                                }}
                                className="group flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-900 data-[focus]:bg-amber-100 cursor-pointer"
                            >
                                <Cog6ToothIcon className="w-4 h-4 text-amber-700 group-data-[focus]:text-amber-800" />
                                Settings
                            </button>
                        </MenuItem>
                        )}
                        <MenuItem>
                            <button
                                type="button"
                                onPointerDown={stopDrag}
                                onMouseDown={stopDrag}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                                className="group flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-900 data-[focus]:bg-red-50 data-[focus]:text-red-600 cursor-pointer"
                            >
                                <TrashIcon className="w-4 h-4 text-amber-700 group-data-[focus]:text-red-500" />
                                Delete
                            </button>
                        </MenuItem>
                    </MenuItems>
                </Menu>
            )}
        </div>
    );
};

export default WidgetWrapper;

