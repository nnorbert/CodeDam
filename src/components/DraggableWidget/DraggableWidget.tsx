const DraggableWidget = ({ widget }: { widget: { type: string; label: string } }) => {
  return (
    <div
      className="p-2 my-2 bg-yellow-200 rounded shadow cursor-grab"
      draggable={false}
    >
      {widget.label}
    </div>
  );
}

export default DraggableWidget;
