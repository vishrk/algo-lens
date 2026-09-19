import type { ReactNode } from 'react'
import type { ExecutionStep, ExecutionTrace } from '../engine/trace'

interface TraceSummaryProps {
  status: 'idle' | 'running' | 'done' | 'failed'
  trace: ExecutionTrace | null
  runError: string | null
  currentStep: ExecutionStep | null
}

export function TraceSummary({ status, trace, runError, currentStep }: TraceSummaryProps) {
  if (status === 'idle') {
    return <Centered>Press Run to execute your code</Centered>
  }
  if (status === 'running') {
    return <Centered>Running…</Centered>
  }
  if (status === 'failed' && !trace) {
    return <Centered className="text-red-400">{runError}</Centered>
  }
  if (!trace) {
    return null
  }

  return (
    <div className="min-w-0 flex-1 overflow-auto border-r border-border p-4 font-mono text-sm text-text">
      <p className="text-text-dim">
        {trace.steps.length} execution step{trace.steps.length === 1 ? '' : 's'} recorded
      </p>

      {currentStep && (
        <p className="mt-1 text-text-dim">
          line {currentStep.lineNumber} · {currentStep.eventType}
          {currentStep.state.stack.length > 0 &&
            ` · ${currentStep.state.stack.map((f) => f.functionName).join(' → ')}`}
        </p>
      )}

      {trace.error && (
        <div className="mt-3 rounded border border-red-500/40 bg-red-500/10 p-2 text-red-400">
          {trace.error.type}
          {trace.error.lineNumber != null ? ` (line ${trace.error.lineNumber})` : ''}:{' '}
          {trace.error.message}
        </div>
      )}

      {trace.stdout && (
        <div className="mt-3">
          <p className="text-xs uppercase tracking-wide text-text-dim">stdout</p>
          <pre className="mt-1 whitespace-pre-wrap text-text">{trace.stdout}</pre>
        </div>
      )}

    </div>
  )
}

function Centered({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center justify-center border-r border-border text-sm text-text-dim ${className}`}
    >
      {children}
    </div>
  )
}
