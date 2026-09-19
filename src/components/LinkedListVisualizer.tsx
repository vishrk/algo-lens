import { extractLinkedLists } from '../engine/linkedListVariables'
import { formatValue } from '../engine/formatValue'
import type { ExecutionState, VariableValue } from '../engine/trace'

interface LinkedListVisualizerProps {
  state: ExecutionState | null
}

function formatNodeData(data: Record<string, VariableValue>): string {
  const entries = Object.entries(data)
  if (entries.length === 1) return formatValue(entries[0][1])
  return entries.map(([key, value]) => `${key}=${formatValue(value)}`).join(', ')
}

export function LinkedListVisualizer({ state }: LinkedListVisualizerProps) {
  if (!state) return null

  const chains = extractLinkedLists(state)
  if (chains.length === 0) return null

  return (
    <div className="flex flex-col gap-4 overflow-x-auto border-b border-border p-3">
      {chains.map((chain, chainIndex) => (
        <div key={chainIndex} className="flex items-end font-mono text-sm">
          {chain.nodes.map((node, index) => {
            const pointersHere = chain.pointers.filter((p) => p.nodeIndex === index)
            return (
              <div key={node.objectId} className="flex items-end">
                <div className="flex flex-col items-center">
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
                  <div className="flex h-10 min-w-12 items-center justify-center border border-border px-2 text-text">
                    {formatNodeData(node.data)}
                  </div>
                </div>
                <span className="mx-1 mb-4 text-text-dim">→</span>
              </div>
            )
          })}
          <span className="mb-4 text-text-dim">{chain.hasCycle ? '⟲ (cycle)' : 'null'}</span>
        </div>
      ))}
    </div>
  )
}
