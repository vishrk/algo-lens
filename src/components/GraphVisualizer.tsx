import { extractGraphs } from '../engine/graphVariables'
import type { ExecutionState } from '../engine/trace'

interface GraphVisualizerProps {
  state: ExecutionState | null
}

export function GraphVisualizer({ state }: GraphVisualizerProps) {
  if (!state) return null

  const graphs = extractGraphs(state)
  if (graphs.length === 0) return null

  return (
    <div className="flex flex-col gap-4 overflow-x-auto border-b border-border p-3 font-mono text-sm">
      {graphs.map((graph) => (
        <div key={graph.name}>
          <p className="mb-1 text-xs uppercase tracking-wide text-text-dim">{graph.name}</p>

          <div className="flex flex-wrap gap-3">
            {graph.nodeIds.map((id) => {
              const pointersHere = graph.pointers.filter((p) => p.nodeId === id)
              return (
                <div key={id} className="flex flex-col items-center">
                  {pointersHere.length > 0 && (
                    <div className="mb-0.5 flex flex-col items-center gap-0.5">
                      {pointersHere.map((p) => (
                        <span
                          key={p.name}
                          className="whitespace-nowrap rounded bg-accent/20 px-1 text-[10px] leading-tight text-accent"
                        >
                          {p.name} ↓
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-2 ${
                      pointersHere.length > 0
                        ? 'border-accent text-accent'
                        : 'border-border text-text'
                    }`}
                  >
                    {id}
                  </div>
                </div>
              )
            })}
          </div>

          {graph.edges.length > 0 && (
            <p className="mt-2 text-text-dim">
              edges: {graph.edges.map((e) => `${e.from}→${e.to}`).join(', ')}
            </p>
          )}

          {graph.collections.map((collection) => (
            <p key={collection.name} className="mt-1">
              <span className="text-accent">{collection.name}</span>
              <span className="text-text-dim">: [{collection.nodeIds.join(', ')}]</span>
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}
