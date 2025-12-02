import type { ToolboxItemData } from "../ToolBoxItem/ToolBoxItem";
import ToolBoxItem from "../ToolBoxItem/ToolBoxItem";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronUpIcon } from "lucide-react";

const ToolBox = ({ widgets }: { widgets: ToolboxItemData[] }) => {
  return (<div>
    <Disclosure>
      {({ open }) => (
        <div className="border rounded-lg mb-2 overflow-hidden">
          <DisclosureButton className="flex justify-between items-center w-full px-3 py-2 text-left font-semibold bg-yellow-100 hover:bg-yellow-200">
            TEST
            <ChevronUpIcon
              className={`w-4 h-4 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </DisclosureButton>

          <DisclosurePanel className="p-2 bg-yellow-50 grid grid-cols-2 gap-2">
            {widgets.map((w) => (
              <ToolBoxItem key={`tool-${w.type}`} widget={w} />
            ))}
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  </div>);
}

export default ToolBox;
