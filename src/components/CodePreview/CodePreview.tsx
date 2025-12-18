type Props = {
  code: React.ReactNode[];
};

const CodePreview = ({ code }: Props) => {
  return (
    <div className="flex flex-col h-full">
      {/* Title bar */}
      <div
        className="flex items-center px-4 py-2 text-sm font-medium"
        style={{ backgroundColor: "#252526", color: "#CCCCCC" }}
      >
        <span>Code Preview</span>
      </div>

      {/* Editor area */}
      <div
        className="flex-1 overflow-auto font-mono text-sm"
        style={{ backgroundColor: "#1E1E1E" }}
      >
        {code.map((codeLine, index) => (
          <div
            key={index}
            className="flex hover:bg-white/5 transition-colors"
            style={{ minHeight: "1.5rem" }}
          >
            {/* Line number gutter */}
            <div
              className="select-none text-right pr-4 pl-2"
              style={{
                color: "#858585",
                minWidth: "3rem",
                backgroundColor: "#1E1E1E",
              }}
            >
              {index + 1}
            </div>

            {/* Code content */}
            <div className="flex-1 pr-4" style={{ color: "#D4D4D4" }}>
              {codeLine}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodePreview;
