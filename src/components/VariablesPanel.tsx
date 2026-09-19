import { formatValue } from '../engine/formatValue'
import type { ExecutionStep, VariableValue } from '../engine/trace'

interface VariablesPanelProps {
  currentStep: ExecutionStep | null
  previousStep: ExecutionStep | null
}

interface VariableRow {
  name: string
  value: VariableValue
  previousValue?: VariableValue
  changed: boolean
}

function valuesEqual(a: VariableValue, b: VariableValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function buildRows(
  scope: Record<string, VariableValue>,
  previousScope: Record<string, VariableValue> | undefined,
): VariableRow[] {
  return Object.entries(scope).map(([name, value]) => {
    const previousValue = previousScope?.[name]
    const changed = previousValue === undefined || !valuesEqual(previousValue, value)
    return { name, value, previousValue, changed }
  })
}

export function VariablesPanel({ currentStep, previousStep }: VariablesPanelProps) {
  if (!currentStep) {
    return (
      <div className="min-w-0 flex-1 overflow-auto p-3 font-mono text-sm text-text-dim">
        No variables yet — run and step through your code.
      </div>
    )
  }

  // At module scope, CPython's frame locals *are* its globals (same dict) —
  // showing both would just duplicate the same variables under two labels.
  const top = currentStep.state.stack.at(-1)
  const frame = top && top.functionName !== '<module>' ? top : undefined
  const previousFrame = previousStep?.state.stack.at(-1)

  const localRows = frame ? buildRows(frame.locals, previousFrame?.locals) : []
  const globalRows = buildRows(currentStep.state.globals, previousStep?.state.globals)

  return (
    <div className="min-w-0 flex-1 overflow-auto p-3 font-mono text-sm">
      {frame && <ScopeSection title={`Locals — ${frame.functionName}`} rows={localRows} />}
      <ScopeSection title="Globals" rows={globalRows} />
    </div>
  )
}

function ScopeSection({ title, rows }: { title: string; rows: VariableRow[] }) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-text-dim">{title}</p>
      {rows.length === 0 ? (
        <p className="text-text-dim">—</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((row) => (
            <li
              key={row.name}
              className={`rounded px-1.5 py-0.5 ${row.changed ? 'bg-accent/10' : ''}`}
            >
              <div className="flex items-baseline gap-2">
                <span className={row.changed ? 'text-accent' : 'text-text'}>{row.name}</span>
                <span className="text-xs text-text-dim">{row.value.type}</span>
                <span className="ml-auto">{formatValue(row.value)}</span>
              </div>
              {row.changed && row.previousValue !== undefined && (
                <div className="text-xs text-text-dim">
                  previous: {formatValue(row.previousValue)}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
