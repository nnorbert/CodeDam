import type { Executor } from "../../libraries/CodeBuilder/Executor";
import type { ExecutionController } from "../../libraries/CodeBuilder/ExecutionController";
import type { CodeDamProjectFile } from "../../libraries/CodeBuilder/persistence/types";
import {
  getCodeLanguageFromProject,
  loadProject,
} from "../../libraries/CodeBuilder/persistence/deserialize";
import type { CodeLanguageType } from "../../utils/constants";

export interface RestoreProjectParams {
  file: CodeDamProjectFile;
  mainExecutor: Executor;
  executionController: ExecutionController;
  resetUiState: () => void;
  setCodeLanguage?: (language: CodeLanguageType) => void;
  setLastProjectName?: (name: string) => void;
  forceUpdate: () => void;
}

/**
 * Full §5.1 reset + restore sequence: stop execution, clear UI state,
 * erase the canvas, deserialize the file, apply preferences, refresh UI.
 */
export function restoreProject(params: RestoreProjectParams): string[] {
  const {
    file,
    mainExecutor,
    executionController,
    resetUiState,
    setCodeLanguage,
    setLastProjectName,
    forceUpdate,
  } = params;

  executionController.stop();
  resetUiState();
  mainExecutor.clear();

  const warnings = loadProject(mainExecutor, file);

  const codeLanguage = getCodeLanguageFromProject(file);
  if (codeLanguage && setCodeLanguage) {
    setCodeLanguage(codeLanguage);
  }

  if (file.metadata?.name && setLastProjectName) {
    setLastProjectName(file.metadata.name);
  }

  mainExecutor.notifyChange();
  forceUpdate();

  return warnings;
}
