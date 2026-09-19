import { buildCallTree, countNodes, findActiveNodeId, type CallTreeNode } from '../engine/callTree'
import { formatValue } from '../engine/formatValue'
import type { ExecutionStep } from '../engine/trace'

interface CallTreeViewProps {
  steps: ExecutionStep[]
  stepIndex: number
}

export function CallTreeView({ steps, stepIndex }: CallTreeViewProps) {
  const roots = buildCallTree(steps)
  // A single flat call adds nothing beyond the Call Stack panel — only show
  // this once there's an actual branching/recursive call structure.
  if (countNodes(roots) <= 1) return null

  const activeId = findActiveNodeId(roots, stepIndex)

  return (
    <div className="overflow-x-auto border-b border-border p-3">
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-text-dim">Call Tree</p>
      <ul className="font-mono text-sm">
        {roots.map((node) => (
          <CallTreeNodeItem key={node.id} node={node} activeId={activeId} />
        ))}
      </ul>
    </div>
  )
}

function CallTreeNodeItem({
  node,
  activeId,
}: {
  node: CallTreeNode
  activeId: number | null
}) {
  const args = Object.entries(node.args)
    .map(([name, value]) => `${name}=${formatValue(value)}`)
    .join(', ')
  const isActive = node.id === activeId

  return (
    <li>
      <div
        className={`inline-block rounded px-1.5 py-0.5 ${isActive ? 'bg-accent/15 text-accent' : 'text-text'}`}
      >
        {node.functionName}({args})
        {node.returnValue !== undefined && (
          <span className="text-text-dim"> → {formatValue(node.returnValue)}</span>
        )}
      </div>
      {node.children.length > 0 && (
        <ul className="ml-2 border-l border-border pl-3">
          {node.children.map((child) => (
            <CallTreeNodeItem key={child.id} node={child} activeId={activeId} />
          ))}
        </ul>
      )}
    </li>
  )
}
