type CanvasWidget = {
  id: string;
  type: string;
  label: string;
};

type Props = {
  widgets: CanvasWidget[];
};

const CodePreview = ({ widgets }: Props) => {
  return (
    <>
      <h2 className="font-bold text-lg mb-4">Code Preview</h2>
      <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
        {/* Here you'll render the generated code later */}
        {JSON.stringify(widgets, null, 2)}
      </pre>
    </>
  );
};

export default CodePreview;

