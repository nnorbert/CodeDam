import type { Executor } from "./Executor";
import type { ExecutionGenerator, ExecutionStackSnapshot, StepYield } from "./ExecutionTypes";
import type { IGenericWidget } from "./interfaces/IGenericWidget";

export type ExecutionState = 'idle' | 'running' | 'paused' | 'finished';

export interface StepResult {
    done: boolean;
    currentWidget?: IGenericWidget;
}

export class ExecutionController {
    private generator: ExecutionGenerator | null = null;
    private executor: Executor | null = null;
    private isWaitingForAsync = false;
    private state: ExecutionState = 'idle';
    private autoPlayInterval: ReturnType<typeof setInterval> | null = null;
    private currentWidget: IGenericWidget | null = null;

    // Callbacks for UI updates
    private onStateChange: ((state: ExecutionState) => void) | null = null;
    private onWidgetChange: ((widget: IGenericWidget | null) => void) | null = null;
    private onExecutionStackChange: (() => void) | null = null;

    /**
     * Set callback for when execution state changes
     */
    setOnStateChange(callback: ((state: ExecutionState) => void) | null): void {
        this.onStateChange = callback;
    }

    /**
     * Set callback for when current widget changes (for highlighting)
     */
    setOnWidgetChange(callback: ((widget: IGenericWidget | null) => void) | null): void {
        this.onWidgetChange = callback;
    }

    /**
     * Set callback for when execution stack changes
     */
    setOnExecutionStackChange(callback: (() => void) | null): void {
        this.onExecutionStackChange = callback;
    }

    /**
     * Get the current execution stack snapshot
     */
    getExecutionStackSnapshot(): ExecutionStackSnapshot {
        return this.executor?.getExecutionStackSnapshot() ?? [];
    }

    /**
     * Get the current execution state
     */
    getState(): ExecutionState {
        return this.state;
    }

    /**
     * Get the currently executing widget
     */
    getCurrentWidget(): IGenericWidget | null {
        return this.currentWidget;
    }

    /**
     * Check if execution is waiting for an async operation
     */
    isWaiting(): boolean {
        return this.isWaitingForAsync;
    }

    private setState(newState: ExecutionState): void {
        this.state = newState;
        this.onStateChange?.(newState);
    }

    private setCurrentWidget(widget: IGenericWidget | null): void {
        // Clear previous widget's execution state
        if (this.currentWidget) {
            this.currentWidget.inExecution = false;
        }
        
        this.currentWidget = widget;
        
        // Set new widget's execution state
        if (widget) {
            widget.inExecution = true;
        }
        
        this.onWidgetChange?.(widget);
    }

    /**
     * Initialize execution with the main executor
     */
    start(executor: Executor): void {
        this.executor = executor;
        
        // Clear any previous execution stack state and wire up callback
        executor.clearExecutionStack();
        executor.setOnExecutionStackChange(() => {
            this.onExecutionStackChange?.();
        });
        
        this.generator = executor.execute();
        this.setState('running');
        this.setCurrentWidget(null);
    }

    /**
     * Execute the next step.
     * Returns when a 'step' yield is encountered or execution is done.
     * Automatically handles 'await' yields internally.
     */
    async step(): Promise<StepResult> {
        if (!this.generator) {
            return { done: true };
        }

        // Ignore step events while waiting for async operation
        if (this.isWaitingForAsync) {
            return { done: false, currentWidget: this.currentWidget ?? undefined };
        }

        let result = await this.generator.next();

        // Keep consuming 'await' yields until we hit a 'step' or done
        while (!result.done && result.value.type === 'await') {
            this.isWaitingForAsync = true;
            try {
                await result.value.promise;
            } finally {
                this.isWaitingForAsync = false;
            }
            result = await this.generator.next();
        }

        if (result.done) {
            this.finish();
            return { done: true };
        }

        // It's a 'step' yield
        const stepValue = result.value as Extract<StepYield, { type: 'step' }>;
        this.setCurrentWidget(stepValue.widget);
        return { done: false, currentWidget: stepValue.widget };
    }

    /**
     * Start auto-play mode - executes one step per interval
     */
    play(intervalMs: number = 1000): void {
        if (this.state === 'idle') {
            return; // Need to call start() first
        }

        if (this.autoPlayInterval) {
            return; // Already playing
        }

        this.setState('running');
        
        this.autoPlayInterval = setInterval(async () => {
            const result = await this.step();
            if (result.done) {
                this.stopAutoPlay();
            }
        }, intervalMs);
    }

    /**
     * Pause auto-play mode
     */
    pause(): void {
        this.stopAutoPlay();
        if (this.state === 'running') {
            this.setState('paused');
        }
    }

    /**
     * Stop execution completely and reset
     */
    stop(): void {
        this.stopAutoPlay();
        
        // Clear execution stack before nulling executor
        if (this.executor) {
            this.executor.clearExecutionStack();
            this.executor.setOnExecutionStackChange(null);
        }
        
        this.generator = null;
        this.executor = null;
        this.isWaitingForAsync = false;
        this.setCurrentWidget(null);
        this.setState('idle');
    }

    /**
     * Clean up when execution finishes naturally
     */
    private finish(): void {
        this.stopAutoPlay();
        
        // Clear execution stack when finished
        if (this.executor) {
            this.executor.clearExecutionStack();
            this.executor.setOnExecutionStackChange(null);
        }
        
        this.generator = null;
        this.setCurrentWidget(null);
        this.setState('finished');
    }

    private stopAutoPlay(): void {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

