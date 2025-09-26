import { useDroppable } from "@dnd-kit/core";

const DroppableCanvas = ({ children }: { children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id: "canvas" });
  
    return (
      <div
        ref={setNodeRef}
        className={`min-h-[300px] p-4 border-2 rounded ${
          isOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <h2 className="font-bold mb-2">Canvas</h2>
        {children}
      </div>
    );
  }

  export default DroppableCanvas;
  