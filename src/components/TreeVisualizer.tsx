import { extractTrees, type TreeNode, type TreePointer } from '../engine/treeVariables'
import { formatValue } from '../engine/formatValue'
import type { ExecutionState, VariableValue } from '../engine/trace'

interface TreeVisualizerProps {
  state: ExecutionState | null
}

function formatNodeData(data: Record<string, VariableValue>): string {
  const entries = Object.entries(data)
  if (entries.length === 1) return formatValue(entries[0][1])
  return entries.map(([key, value]) => `${key}=${formatValue(value)}`).join(', ')
}

export function TreeVisualizer({ state }: TreeVisualizerProps) {
  if (!state) return null

  const trees = extractTrees(state)
  if (trees.length === 0) return null

  return (
    <div className="flex flex-col gap-4 overflow-x-auto border-b border-border p-3">
      {trees.map((tree, index) => (
        <ul key={index} className="font-mono text-sm">
          <TreeNodeItem node={tree.root} pointers={tree.pointers} label={null} />
        </ul>
      ))}
    </div>
  )
}

function TreeNodeItem({
  node,
  pointers,
  label,
}: {
  node: TreeNode
  pointers: TreePointer[]
  label: string | null
}) {
  const pointersHere = pointers.filter((p) => p.objectId === node.objectId)

  return (
    <li>
      <div className="inline-flex items-center gap-1 rounded px-1.5 py-0.5">
        {label && <span className="text-text-dim">{label}: </span>}
        <span className="text-text">{formatNodeData(node.data)}</span>
        {pointersHere.map((p) => (
          <span
            key={p.name}
            className="rounded bg-accent/20 px-1 text-[10px] leading-tight text-accent"
          >
            {p.name}
          </span>
        ))}
      </div>
      <ul className="ml-2 border-l border-border pl-3">
        {node.edges.map((edge) =>
          edge.child ? (
            <TreeNodeItem key={edge.fieldName} node={edge.child} pointers={pointers} label={edge.fieldName} />
          ) : (
            <li key={edge.fieldName} className="px-1.5 py-0.5 text-text-dim">
              {edge.fieldName}: null
            </li>
          ),
        )}
      </ul>
    </li>
  )
}
