import { describe, expect, it } from 'vitest'
import { buildCallTree, countNodes, findActiveNodeId } from './callTree'
import type { ExecutionStep, VariableValue } from './trace'

function intVar(value: number): VariableValue {
  return { kind: 'primitive', type: 'int', value }
}

let counter = 0
function step(
  eventType: ExecutionStep['eventType'],
  functionName: string,
  locals: Record<string, VariableValue> = {},
  returnValue?: VariableValue,
): ExecutionStep {
  return {
    stepNumber: ++counter,
    lineNumber: 1,
    eventType,
    state: {
      lineNumber: 1,
      globals: {},
      stack: [
        { functionName: '<module>', lineNumber: 1, locals: {} },
        { functionName, lineNumber: 1, locals },
      ],
    },
    returnValue,
  }
}

describe('buildCallTree', () => {
  it('builds a fib(3)-shaped tree with correct parent-child relationships and depth', () => {
    // fib(3) -> fib(2), fib(1) ; fib(2) -> fib(1), fib(0)
    const steps: ExecutionStep[] = [
      step('call', 'fib', { n: intVar(3) }),
      step('call', 'fib', { n: intVar(2) }),
      step('call', 'fib', { n: intVar(1) }),
      step('return', 'fib', { n: intVar(1) }, intVar(1)),
      step('call', 'fib', { n: intVar(0) }),
      step('return', 'fib', { n: intVar(0) }, intVar(0)),
      step('return', 'fib', { n: intVar(2) }, intVar(1)),
      step('call', 'fib', { n: intVar(1) }),
      step('return', 'fib', { n: intVar(1) }, intVar(1)),
      step('return', 'fib', { n: intVar(3) }, intVar(2)),
    ]

    const [root] = buildCallTree(steps)

    expect(root.functionName).toBe('fib')
    expect(root.depth).toBe(0)
    expect(root.args.n).toEqual(intVar(3))
    expect(root.returnValue).toEqual(intVar(2))
    expect(root.children).toHaveLength(2)

    const [fib2, fib1] = root.children
    expect(fib2.args.n).toEqual(intVar(2))
    expect(fib2.depth).toBe(1)
    expect(fib2.children.map((c) => c.args.n)).toEqual([intVar(1), intVar(0)])
    expect(fib1.args.n).toEqual(intVar(1))
    expect(fib1.children).toHaveLength(0)

    expect(countNodes(buildCallTree(steps))).toBe(5)
  })

  it('ignores module-level call/return events', () => {
    const moduleOnlyStep: ExecutionStep = {
      stepNumber: 1,
      lineNumber: 1,
      eventType: 'call',
      state: { lineNumber: 1, globals: {}, stack: [{ functionName: '<module>', lineNumber: 1, locals: {} }] },
    }
    expect(buildCallTree([moduleOnlyStep])).toEqual([])
  })

  it('builds independent sibling trees for separate top-level calls', () => {
    const steps: ExecutionStep[] = [
      step('call', 'factorial', { n: intVar(2) }),
      step('return', 'factorial', { n: intVar(2) }, intVar(2)),
      step('call', 'factorial', { n: intVar(3) }),
      step('return', 'factorial', { n: intVar(3) }, intVar(6)),
    ]
    const roots = buildCallTree(steps)
    expect(roots).toHaveLength(2)
    expect(roots[0].returnValue).toEqual(intVar(2))
    expect(roots[1].returnValue).toEqual(intVar(6))
  })
})

describe('findActiveNodeId', () => {
  it('finds the deepest node whose step range contains the given index', () => {
    const steps: ExecutionStep[] = [
      step('call', 'fib', { n: intVar(2) }), // index 0
      step('call', 'fib', { n: intVar(1) }), // index 1
      step('return', 'fib', { n: intVar(1) }, intVar(1)), // index 2
      step('call', 'fib', { n: intVar(0) }), // index 3
      step('return', 'fib', { n: intVar(0) }, intVar(0)), // index 4
      step('return', 'fib', { n: intVar(2) }, intVar(1)), // index 5
    ]
    const roots = buildCallTree(steps)
    const [root] = roots
    const [child1, child0] = root.children

    expect(findActiveNodeId(roots, 1)).toBe(child1.id)
    expect(findActiveNodeId(roots, 3)).toBe(child0.id)
    expect(findActiveNodeId(roots, 5)).toBe(root.id)
    expect(findActiveNodeId(roots, 0)).toBe(root.id)
  })

  it('returns null when the index falls outside every node', () => {
    expect(findActiveNodeId([], 0)).toBeNull()
  })
})
