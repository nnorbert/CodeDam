import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import type { ExecutionState } from "../../libraries/CodeBuilder/ExecutionController";

interface ProjectToolbarProps {
  executionState: ExecutionState;
  onSave: () => void;
  onLoad: () => void;
}

const LOCKED_TOOLTIP = "Stop execution before saving or loading.";

export default function ProjectToolbar({ executionState, onSave, onLoad }: ProjectToolbarProps) {
  const isDisabled = executionState === "running" || executionState === "paused";

  return (
    <div className="main-canvas-header-actions flex items-center gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={isDisabled}
        title={isDisabled ? LOCKED_TOOLTIP : "Save project"}
        className="main-canvas-header-btn"
      >
        <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
        Save
      </button>
      <button
        type="button"
        onClick={onLoad}
        disabled={isDisabled}
        title={isDisabled ? LOCKED_TOOLTIP : "Load project"}
        className="main-canvas-header-btn"
      >
        <ArrowUpTrayIcon className="h-4 w-4" aria-hidden="true" />
        Load
      </button>
    </div>
  );
}
