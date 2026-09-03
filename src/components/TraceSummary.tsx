import type { ReactNode } from 'react'
import { formatValue } from '../engine/formatValue'
import type { ExecutionTrace } from '../engine/trace'

interface TraceSummaryProps {
  status: 'idle' | 'running' | 'done' | 'failed'
  trace: ExecutionTrace | null
  runError: string | null
}

export function TraceSummary({ status, trace, runError }: TraceSummaryProps) {
  if (status === 'idle') {
    return <Centered>Press Run to execute your code</Centered>
  }
  if (status === 'running') {
    return <Centered>Running…</Centered>
  }
  if (status === 'failed') {
    return <Centered className="text-red-400">{runError}</Centered>
  }
  if (!trace) {
    return null
  }

  const finalGlobals = trace.finalState ? Object.entries(trace.finalState.globals) : []

  return (
    <div className="flex-1 overflow-auto p-4 font-mono text-sm text-text">
      <p className="text-text-dim">
        {trace.steps.length} execution step{trace.steps.length === 1 ? '' : 's'} recorded
      </p>

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

      {finalGlobals.length > 0 && (
        <div className="mt-3">
          <p className="text-xs uppercase tracking-wide text-text-dim">
            final variables
          </p>
          <ul className="mt-1 space-y-0.5">
            {finalGlobals.map(([name, value]) => (
              <li key={name}>
                <span className="text-accent">{name}</span> = {formatValue(value)}
              </li>
            ))}
          </ul>
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
    <div className={`flex flex-1 items-center justify-center text-sm text-text-dim ${className}`}>
      {children}
    </div>
  )
}
