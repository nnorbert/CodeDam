import { CodeLanguages, type CodeLanguageType } from "../../utils/constants";

type Props = {
  code: React.ReactNode[];
  language: CodeLanguageType;
  onLanguageChange: (language: CodeLanguageType) => void;
  /** Set of line keys that should be highlighted (from widget activeLineKeys) */
  highlightedLineKeys?: Set<string>;
};

const CodePreview = ({ code, language, onLanguageChange, highlightedLineKeys = new Set() }: Props) => {
  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden">
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2 text-sm font-medium"
        style={{ backgroundColor: "#252526", color: "#CCCCCC" }}
      >
        <span>Code Preview</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as CodeLanguageType)}
          className="text-xs px-2 py-1 rounded border-0 outline-none cursor-pointer"
          style={{
            backgroundColor: "#3C3C3C",
            color: "#CCCCCC",
            minWidth: "100px",
          }}
        >
          <option value={CodeLanguages.JAVASCRIPT}>JavaScript</option>
          <option value={CodeLanguages.PYTHON}>Python</option>
        </select>
      </div>

      {/* Editor area */}
      <div
        className="flex-1 overflow-auto font-mono text-sm"
        style={{ backgroundColor: "#1E1E1E" }}
      >
        {code.map((codeLine, index) => {
          // Check if this line should be highlighted based on the React element's key
          const lineKey = (codeLine as React.ReactElement)?.key?.toString() || '';
          const isHighlighted = highlightedLineKeys.has(lineKey);
          
          return (
            <div
              key={index}
              className="flex hover:bg-white/5 transition-colors"
              style={{ 
                minHeight: "1.5rem",
                backgroundColor: isHighlighted ? "rgba(251, 191, 36, 0.15)" : undefined,
              }}
            >
              {/* Line number gutter */}
              <div
                className="select-none text-right pr-4 pl-2"
                style={{
                  color: isHighlighted ? "#FBB936" : "#858585",
                  minWidth: "3rem",
                  backgroundColor: "#1E1E1E",
                }}
              >
                {index + 1}
              </div>

              {/* Code content */}
              <div className="flex-1 pr-4" style={{ color: "#D4D4D4", whiteSpace: "pre" }}>
                {codeLine}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CodePreview;
