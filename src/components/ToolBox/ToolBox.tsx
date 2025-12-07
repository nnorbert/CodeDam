import { useRef } from "react";
import type { ToolboxItemData } from "../ToolBoxItem/ToolBoxItem";
import ToolBoxItem from "../ToolBoxItem/ToolBoxItem";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronUpIcon } from "lucide-react";

const ToolBox = ({ widgets }: { widgets: ToolboxItemData[] }) => {
  const widgetsMap = useRef<Record<string, ToolboxItemData[]>>(null);

  if (!widgetsMap.current) {
    widgetsMap.current = widgets.reduce<Record<string, ToolboxItemData[]>>((acc, w) => {
      if (!acc[w.getCategory()]) {
        acc[w.getCategory()] = [];
      }
      acc[w.getCategory()].push(w);
      return acc;
    }, {} as Record<string, ToolboxItemData[]>);
  }

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(widgetsMap.current).map(([category, categoryWidgets]) => (
        <Disclosure key={category}>
          {({ open }) => (
            <div className="border rounded-lg overflow-hidden">
              <DisclosureButton className="flex justify-between items-center w-full px-3 py-2 text-left font-semibold bg-yellow-100 hover:bg-yellow-200 capitalize">
                {category}
                <ChevronUpIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    open ? "" : "rotate-180"
                  }`}
                />
              </DisclosureButton>

              <DisclosurePanel className="p-2 bg-yellow-50 grid grid-cols-2 gap-2">
                {categoryWidgets.map((w) => (
                  <ToolBoxItem key={`tool-${w.getType()}`} widget={w} />
                ))}
              </DisclosurePanel>
            </div>
          )}
        </Disclosure>
      ))}
    </div>
  );
}

export default ToolBox;
