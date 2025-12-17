import type { PropsWithChildren } from "react";
import { EllipsisVerticalIcon, Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { confirmationModal } from "../ConfirmationModal";

type Props = PropsWithChildren<{
    onDelete: () => void;
    onSettings?: () => void;
}>;

const WidgetWrapper = ({ children, onDelete, onSettings }: Props) => {
    const handleDelete = async () => {
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

    // Prevent drag from starting when clicking the menu
    const stopDrag = (e: React.PointerEvent | React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="flex flex-row items-center gap-1">
            <div className="flex-1">{children}</div>
            <Menu as="div" className="relative self-start">
                <MenuButton
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer pt-4 pb-4"
                    onPointerDown={stopDrag}
                    onMouseDown={stopDrag}
                    onClick={(e) => e.stopPropagation()}
                >
                    <EllipsisVerticalIcon className="w-4 h-4" />
                </MenuButton>
                <MenuItems
                    anchor="bottom end"
                    className="absolute right-0 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50"
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
                                onSettings();
                            }}
                            className="group flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 cursor-pointer"
                        >
                            <Cog6ToothIcon className="w-4 h-4 text-gray-400 group-data-[focus]:text-gray-600" />
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
                            className="group flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 data-[focus]:bg-red-50 data-[focus]:text-red-600 cursor-pointer"
                        >
                            <TrashIcon className="w-4 h-4 text-gray-400 group-data-[focus]:text-red-500" />
                            Delete
                        </button>
                    </MenuItem>
                </MenuItems>
            </Menu>
        </div>
    );
};

export default WidgetWrapper;

