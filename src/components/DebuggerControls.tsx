import type { ExecutionController, PlaybackSpeed } from '../hooks/useExecutionController'

const SPEEDS: PlaybackSpeed[] = [1, 2, 4]

const buttonClass =
  'rounded border border-border px-2 py-1 text-sm text-text-dim hover:text-text disabled:opacity-30 disabled:hover:text-text-dim'

export function DebuggerControls(controller: ExecutionController) {
  const {
    stepIndex,
    totalSteps,
    isPlaying,
    speed,
    canStepBack,
    canStepForward,
    reset,
    stepForward,
    stepBackward,
    play,
    pause,
    setSpeed,
  } = controller

  const hasTrace = totalSteps > 0

  return (
    <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
      <button
        type="button"
        onClick={reset}
        disabled={!hasTrace}
        title="Reset to the first step"
        className={buttonClass}
      >
        ⏮ Reset
      </button>
      <button
        type="button"
        onClick={stepBackward}
        disabled={!hasTrace || !canStepBack}
        title="Previous step"
        className={buttonClass}
      >
        ◀ Previous
      </button>
      <button
        type="button"
        onClick={stepForward}
        disabled={!hasTrace || !canStepForward}
        title="Next step"
        className={buttonClass}
      >
        Step ▶
      </button>
      {isPlaying ? (
        <button
          type="button"
          onClick={pause}
          title="Pause playback"
          className={buttonClass}
        >
          ⏸ Pause
        </button>
      ) : (
        <button
          type="button"
          onClick={play}
          disabled={!hasTrace || !canStepForward}
          title="Play through remaining steps"
          className={buttonClass}
        >
          ⏵ Continue
        </button>
      )}

      <select
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value) as PlaybackSpeed)}
        title="Playback speed"
        className="rounded border border-border bg-bg px-2 py-1 text-sm text-text"
      >
        {SPEEDS.map((s) => (
          <option key={s} value={s}>
            {s}x
          </option>
        ))}
      </select>

      <span className="ml-auto font-mono text-xs text-text-dim">
        {hasTrace ? `Step ${stepIndex + 1} / ${totalSteps}` : 'No trace yet'}
      </span>
    </div>
  )
}
