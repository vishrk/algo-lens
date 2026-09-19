import { describe, expect, it } from 'vitest'
import { extractLinkedLists } from './linkedListVariables'
import type { ExecutionState, VariableValue } from './trace'

let nextObjectId = 1

function intVar(value: number): VariableValue {
  return { kind: 'primitive', type: 'int', value }
}

const NONE: VariableValue = { kind: 'primitive', type: 'NoneType', value: null }

function node(val: number, next: VariableValue): VariableValue {
  return {
    kind: 'object',
    type: 'ListNode',
    repr: `<ListNode val=${val}>`,
    objectId: nextObjectId++,
    attributes: { val: intVar(val), next },
  }
}

function moduleState(globals: Record<string, VariableValue>): ExecutionState {
  return { lineNumber: 1, stack: [{ functionName: '<module>', lineNumber: 1, locals: {} }], globals }
}

describe('extractLinkedLists', () => {
  it('walks a chain to null and reports its data with the pointer field removed', () => {
    const n3 = node(3, NONE)
    const n2 = node(2, n3)
    const n1 = node(1, n2)
    const state = moduleState({ head: n1 })

    const [chain] = extractLinkedLists(state)

    expect(chain.hasCycle).toBe(false)
    expect(chain.nodes.map((n) => n.data.val)).toEqual([intVar(1), intVar(2), intVar(3)])
    expect(chain.nodes[0].data.next).toBeUndefined()
    expect(chain.pointers).toEqual([{ name: 'head', nodeIndex: 0 }])
  })

  it('does not treat a two-pointer object (tree-shaped) as a linked list', () => {
    const treeNode: VariableValue = {
      kind: 'object',
      type: 'TreeNode',
      repr: '<TreeNode>',
      objectId: nextObjectId++,
      attributes: { val: intVar(1), left: NONE, right: NONE },
    }
    const state = moduleState({ root: treeNode })
    expect(extractLinkedLists(state)).toEqual([])
  })

  it('merges multiple pointer variables into the same chains instead of duplicating it', () => {
    const n2 = node(2, NONE)
    const n1 = node(1, n2)
    const state = moduleState({ head: n1, curr: n2 })

    const chains = extractLinkedLists(state)
    expect(chains).toHaveLength(1)
    expect(chains[0].nodes).toHaveLength(2)

    const pointerNames = chains[0].pointers.map((p) => p.name).sort()
    expect(pointerNames).toEqual(['curr', 'head'])
    expect(chains[0].pointers.find((p) => p.name === 'curr')?.nodeIndex).toBe(1)
  })

  it('detects a cycle without hanging', () => {
    // a.next -> b, b.next -> a (built directly, since the real tracer would
    // itself truncate the second occurrence during serialization).
    const a: Extract<VariableValue, { kind: 'object' }> = {
      kind: 'object',
      type: 'Node',
      repr: '<Node a>',
      objectId: nextObjectId++,
      attributes: { next: NONE },
    }
    const b: Extract<VariableValue, { kind: 'object' }> = {
      kind: 'object',
      type: 'Node',
      repr: '<Node b>',
      objectId: nextObjectId++,
      attributes: { next: a },
    }
    a.attributes!.next = b

    const state = moduleState({ a })
    const [chain] = extractLinkedLists(state)

    expect(chain.hasCycle).toBe(true)
    expect(chain.nodes).toHaveLength(2)
  })

  it('recognizes the serializer-truncated "<circular>" sentinel as a cycle', () => {
    const circularSentinel: VariableValue = { kind: 'object', type: 'Node', repr: '<circular>' }
    const b = node(2, circularSentinel)
    // reuse node() but with a differently-typed payload: patch type to Node-like chain
    const a: VariableValue = {
      kind: 'object',
      type: 'Node',
      repr: '<Node a>',
      objectId: nextObjectId++,
      attributes: { next: { ...b, type: 'Node' } },
    }
    const state = moduleState({ a })
    const [chain] = extractLinkedLists(state)
    expect(chain.hasCycle).toBe(true)
  })

  it('returns nothing when there are no list-like objects in scope', () => {
    expect(extractLinkedLists(moduleState({ x: intVar(1) }))).toEqual([])
  })
})
