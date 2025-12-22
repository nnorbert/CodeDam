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
    <div className="toolbox-workshop flex flex-col gap-1 p-2">
      <div className="text-center font-bold text-sm py-1 text-amber-900">
        🪵 Workshop
      </div>
      {Object.entries(widgetsMap.current).map(([category, categoryWidgets]) => (
        <Disclosure key={category} defaultOpen>
          {({ open }) => (
            <div className="rounded-lg overflow-hidden border-2 border-amber-700/30">
              <DisclosureButton className="toolbox-category-header flex justify-between items-center w-full px-3 py-2 text-left font-semibold capitalize text-sm">
                {category}
                <ChevronUpIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    open ? "" : "rotate-180"
                  }`}
                />
              </DisclosureButton>

              <DisclosurePanel className="p-3 bg-amber-50/80 flex flex-wrap justify-center gap-3">
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
