import { useMemo } from "react";
import type { ToolboxItemData } from "../ToolBoxItem/ToolBoxItem";
import ToolBoxItem from "../ToolBoxItem/ToolBoxItem";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronUpIcon } from "lucide-react";
import { WidgetCategoryOrder, type WidgetCategoryType } from "../../utils/constants";
import "./ToolBox.scss";

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
    <div id="toolbox-container" className="toolbox-workshop h-full">
      <div className="toolbox-header">
        Workshop
      </div>
      <div className="toolbox-content flex flex-col gap-1">
        {orderedCategories.map((category: WidgetCategoryType) => (
          <Disclosure key={category}>
            {({ open }) => (
              <div className="toolbox-category">
                <DisclosureButton className="toolbox-category-header flex justify-between items-center w-full capitalize">
                  {category}
                  <ChevronUpIcon
                    className={`w-6 h-6 stroke-[3px] transition-transform duration-200 ${open ? "" : "rotate-180"
                      }`}
                  />
                </DisclosureButton>

                <DisclosurePanel
                  transition
                  className="toolbox-category-content bg-amber-50/80 flex flex-wrap justify-center gap-3 origin-top transition duration-200 ease-out data-closed:-translate-y-6 data-closed:opacity-0">
                  {widgetsMap[category].map((w) => (
                    <ToolBoxItem key={`tool-${w.getType()}`} widget={w} />
                  ))}
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
}

export default ToolBox;
