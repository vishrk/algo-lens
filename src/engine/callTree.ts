import type { ExecutionStep, VariableValue } from './trace'

export interface CallTreeNode {
  id: number
  functionName: string
  args: Record<string, VariableValue>
  depth: number
  children: CallTreeNode[]
  returnValue?: VariableValue
  /** Index into steps[] where this call was entered / returned. */
  startStep: number
  endStep?: number
}

/**
 * Reconstructs the real call tree — including calls that already returned,
 * unlike the live call stack — purely from the trace's call/return events.
 * No knowledge of recursion or any specific function: a call stack push on
 * 'call' and pop on 'return', nested exactly as CPython nested them.
 */
export function buildCallTree(steps: ExecutionStep[]): CallTreeNode[] {
  const roots: CallTreeNode[] = []
  const openStack: CallTreeNode[] = []
  let nextId = 0

  steps.forEach((step, index) => {
    const frame = step.state.stack.at(-1)
    if (!frame || frame.functionName === '<module>') return

    if (step.eventType === 'call') {
      const node: CallTreeNode = {
        id: nextId++,
        functionName: frame.functionName,
        args: frame.locals,
        depth: openStack.length,
        children: [],
        startStep: index,
      }
      const parent = openStack.at(-1)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
      openStack.push(node)
    } else if (step.eventType === 'return') {
      const node = openStack.pop()
      if (node) {
        node.returnValue = step.returnValue
        node.endStep = index
      }
    }
  })

  return roots
}

export function countNodes(roots: CallTreeNode[]): number {
  return roots.reduce((total, node) => total + 1 + countNodes(node.children), 0)
}

/** The deepest node whose [startStep, endStep] span contains stepIndex. */
export function findActiveNodeId(roots: CallTreeNode[], stepIndex: number): number | null {
  let active: number | null = null

  function visit(node: CallTreeNode) {
    const end = node.endStep ?? Infinity
    if (node.startStep <= stepIndex && stepIndex <= end) {
      active = node.id
      node.children.forEach(visit)
    }
  }

  roots.forEach(visit)
  return active
}
