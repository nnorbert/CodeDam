import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DroppableCanvas from "../DroppableCanvas/DroppableCanvas";
import SortableItem from "../SortableItem/SortableItem";
import type { Executor } from "../../libraries/CodeBuilder/Executor";
import type { IGenericWidget } from "../../libraries/CodeBuilder/interfaces/IGenericWidget";

type Props = {
  id: string;
  executor: Executor;
  widgets: IGenericWidget[];
  emptyMessage?: string;
};

const DroppableBody = ({
  id,
  executor,
  widgets,
  emptyMessage = "Drop widget here",
}: Props) => {
  return (
    <DroppableCanvas id={id} executor={executor}>
      <SortableContext
        items={widgets.map((w) => w.id)}
        strategy={verticalListSortingStrategy}
      >
        {widgets.length === 0 ? (
          <div className="text-gray-400 text-sm">{emptyMessage}</div>
        ) : (
          widgets.map((w) => (
            <SortableItem
              key={w.id}
              id={w.id}
              executor={executor}
              inExecution={w.inExecution}
            >
              {w.render()}
            </SortableItem>
          ))
        )}
      </SortableContext>
    </DroppableCanvas>
  );
};

export default DroppableBody;
