import { useMemo } from "react";
import type { ToolboxItemData } from "../ToolBoxItem/ToolBoxItem";
import ToolBoxItem from "../ToolBoxItem/ToolBoxItem";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronUpIcon } from "lucide-react";
import { WidgetCategoryOrder, type WidgetCategoryType } from "../../utils/constants";

const ToolBox = ({ widgets }: { widgets: ToolboxItemData[] }) => {
  const widgetsMap = useMemo(() => {
    return widgets.reduce<Record<string, ToolboxItemData[]>>((acc, w) => {
      if (!acc[w.getCategory()]) {
        acc[w.getCategory()] = [];
      }
      acc[w.getCategory()].push(w);
      return acc;
    }, {} as Record<string, ToolboxItemData[]>);
  }, [widgets]);

  // Get ordered categories - only include categories that have widgets
  const orderedCategories = useMemo(() => {
    return WidgetCategoryOrder.filter((category) => widgetsMap[category]?.length > 0);
  }, [widgetsMap]);

  return (
    <div className="toolbox-workshop flex flex-col gap-1 p-2">
      <div className="text-center font-bold text-sm py-1 text-amber-900">
        🪵 Workshop
      </div>
      {orderedCategories.map((category: WidgetCategoryType) => (
        <Disclosure key={category}>
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
                {widgetsMap[category].map((w) => (
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
