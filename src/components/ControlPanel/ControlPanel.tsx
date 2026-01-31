import { ForwardIcon, PauseIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import type { ExecutionState } from "../../libraries/CodeBuilder/ExecutionController";
import "./ControlPanel.scss";

type Props = {
  executionState: ExecutionState;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onStep?: () => void;
};

const ControlPanel = ({ executionState, onPlay, onPause, onStop, onStep }: Props) => {
  const isRunning = executionState === 'running';
  const isPaused = executionState === 'paused';
  const isActive = isRunning || isPaused; // Execution has started (not idle/finished)

  const handlePlayPause = () => {
    if (isRunning) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  return (
    <div className="control-panel h-16 border-t border-gray-200 bg-gray-100 flex items-center justify-center gap-4">
      {/* Play/Pause Button - slightly bigger */}
      <button
        className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-md hover:shadow-lg cursor-pointer"
        onClick={handlePlayPause}
        title={isRunning ? "Pause" : "Play"}
      >
        {isRunning ? (
          <PauseIcon className="w-7 h-7" />
        ) : (
          <PlayIcon className="w-7 h-7 ml-0.5" />
        )}
      </button>

      {/* Step Button - always visible, enabled only when paused */}
      <button
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors shadow-md ${
          isPaused
            ? "bg-amber-500 hover:bg-amber-600 text-white hover:shadow-lg cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        onClick={onStep}
        disabled={!isPaused}
        title="Step"
      >
        <ForwardIcon className="w-6 h-6" />
      </button>

      {/* Stop Button - slightly smaller */}
      <button
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors shadow-md ${
          isActive
            ? "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        onClick={onStop}
        disabled={!isActive}
        title="Stop"
      >
        <StopIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ControlPanel;

