import { formatValue } from '../engine/formatValue'
import type { ExecutionStep } from '../engine/trace'

interface CallStackPanelProps {
  currentStep: ExecutionStep | null
}

const EVENT_LABELS: Record<ExecutionStep['eventType'], string> = {
  call: 'entered',
  line: 'running',
  return: 'returned',
  exception: 'exception',
}

export function CallStackPanel({ currentStep }: CallStackPanelProps) {
  if (!currentStep) {
    return (
      <div className="min-w-0 flex-1 overflow-auto border-l border-border p-3 font-mono text-sm text-text-dim">
        No call stack yet — run and step through your code.
      </div>
    )
  }

  // state.stack is outermost-first (module ... innermost); the call stack
  // reads top-down with the currently executing frame on top.
  const frames = [...currentStep.state.stack].reverse()

  return (
    <div className="min-w-0 flex-1 overflow-auto border-l border-border p-3 font-mono text-sm">
      <p className="mb-1 text-xs uppercase tracking-wide text-text-dim">Call Stack</p>
      <ul className="space-y-2">
        {frames.map((frame, index) => {
          const isInnermost = index === 0
          const locals = Object.entries(frame.locals)
          return (
            <li key={`${frame.functionName}-${index}`} className="rounded border border-border p-2">
              <div className="flex items-baseline gap-2">
                <span className={isInnermost ? 'text-accent' : 'text-text'}>
                  {frame.functionName}()
                </span>
                {isInnermost && (
                  <span className="text-xs text-text-dim">{EVENT_LABELS[currentStep.eventType]}</span>
                )}
                {isInnermost && currentStep.eventType === 'return' && currentStep.returnValue && (
                  <span className="ml-auto text-xs text-text-dim">
                    → {formatValue(currentStep.returnValue)}
                  </span>
                )}
              </div>
              {locals.length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-3 text-xs text-text-dim">
                  {locals.map(([name, value]) => (
                    <li key={name}>
                      {name} = <span className="text-text">{formatValue(value)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
