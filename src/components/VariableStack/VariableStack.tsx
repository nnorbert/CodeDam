import type { ExecutionStackSnapshot } from "../../libraries/CodeBuilder/ExecutionTypes";

interface VariableStackProps {
  executionStack: ExecutionStackSnapshot;
}

const VariableStack = ({ executionStack }: VariableStackProps) => {
  const hasVariables = executionStack.some(scope => scope.variables.length > 0);

  const formatValue = (value: unknown): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return `"${value}"`;
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "[object]";
      }
    }
    return String(value);
  };

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: "#1E1E1E" }}>
      {/* Title bar */}
      <div
        className="flex items-center px-4 py-2 text-sm font-medium border-b"
        style={{ backgroundColor: "#2D2D30", color: "#CCCCCC", borderColor: "#3C3C3C" }}
      >
        <span>Variable Stack</span>
        {executionStack.length > 0 && (
          <span className="ml-2 px-1.5 py-0.5 text-xs rounded" style={{ backgroundColor: "#264F78", color: "#9CDCFE" }}>
            {executionStack.length} scope{executionStack.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Stack content area */}
      <div
        className="flex-1 overflow-auto p-3"
        style={{ backgroundColor: "#252526" }}
      >
        {!hasVariables && executionStack.length === 0 ? (
          <div className="text-gray-500 text-sm italic text-center py-4">
            No variables in scope
          </div>
        ) : (
          <div className="space-y-3">
            {executionStack.map((scope, scopeIndex) => (
              <div 
                key={scope.scopeId}
                className="rounded-md overflow-hidden"
                style={{ 
                  backgroundColor: "#2D2D30",
                  marginLeft: `${scopeIndex * 8}px`,
                  borderLeft: scope.isActive ? "2px solid #4EC9B0" : "2px solid #3C3C3C"
                }}
              >
                {/* Scope header */}
                <div 
                  className="px-3 py-1.5 text-xs font-medium flex items-center gap-2"
                  style={{ 
                    backgroundColor: "#333333",
                    color: scope.isActive ? "#4EC9B0" : "#808080"
                  }}
                >
                  <span>{scope.scopeName}</span>
                  {scope.isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  )}
                </div>
                
                {/* Variables list */}
                <div className="px-3 py-2">
                  {scope.variables.length === 0 ? (
                    <div className="text-xs italic" style={{ color: "#6A9955" }}>
                      (empty scope)
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {scope.variables.map((variable) => (
                        <div 
                          key={variable.name}
                          className="flex items-center gap-2 font-mono text-xs"
                        >
                          <span style={{ color: "#9CDCFE" }}>{variable.name}</span>
                          <span style={{ color: "#D4D4D4" }}>=</span>
                          <span style={{ color: "#CE9178" }}>{formatValue(variable.value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VariableStack;

