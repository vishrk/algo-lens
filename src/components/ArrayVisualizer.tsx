import { extractArrayVariables } from '../engine/arrayVariables'
import { formatValue } from '../engine/formatValue'
import type { ExecutionState } from '../engine/trace'

interface ArrayVisualizerProps {
  state: ExecutionState | null
  previousState: ExecutionState | null
}

export function ArrayVisualizer({ state, previousState }: ArrayVisualizerProps) {
  if (!state) return null

  const arrays = extractArrayVariables(state, previousState)
  if (arrays.length === 0) return null

  return (
    <div className="flex flex-col gap-4 overflow-x-auto border-b border-border p-3">
      {arrays.map((array) => (
        <div key={array.name}>
          <p className="mb-1 font-mono text-xs uppercase tracking-wide text-text-dim">
            {array.name}
            {array.lengthChanged && <span className="ml-2 text-accent">length changed</span>}
          </p>
          {array.items.length === 0 ? (
            <p className="font-mono text-sm text-text-dim">(empty)</p>
          ) : (
            <div className="flex">
              {array.items.map((item, index) => {
                const pointersHere = array.pointers.filter((p) => p.index === index)
                const changed = array.changedIndices.has(index)
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-12 items-center justify-center border font-mono text-sm ${
                        index > 0 ? '-ml-px' : ''
                      } ${changed ? 'border-accent bg-accent/15 text-accent' : 'border-border text-text'}`}
                    >
                      {formatValue(item)}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-text-dim">{index}</div>
                    {pointersHere.length > 0 && (
                      <div className="mt-0.5 flex flex-col items-center gap-0.5">
                        {pointersHere.map((p) => (
                          <span
                            key={p.name}
                            className="whitespace-nowrap rounded bg-accent/20 px-1 text-[10px] leading-tight text-accent"
                          >
                            ↑ {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
