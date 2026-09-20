import { describe, expect, it } from 'vitest'
import { extractTrees } from './treeVariables'
import type { ExecutionState, VariableValue } from './trace'

let nextObjectId = 1

function intVar(value: number): VariableValue {
  return { kind: 'primitive', type: 'int', value }
}

const NONE: VariableValue = { kind: 'primitive', type: 'NoneType', value: null }

type ObjectValue = Extract<VariableValue, { kind: 'object' }>

function treeNode(val: number, left: VariableValue, right: VariableValue): ObjectValue {
  return {
    kind: 'object',
    type: 'TreeNode',
    repr: `<TreeNode val=${val}>`,
    objectId: nextObjectId++,
    attributes: { val: intVar(val), left, right },
  }
}

function moduleState(globals: Record<string, VariableValue>): ExecutionState {
  return { lineNumber: 1, stack: [{ functionName: '<module>', lineNumber: 1, locals: {} }], globals }
}

describe('extractTrees', () => {
  it('builds a tree with real edges labeled by their actual field names', () => {
    const left = treeNode(1, NONE, NONE)
    const right = treeNode(3, NONE, NONE)
    const root = treeNode(2, left, right)
    const state = moduleState({ root })

    const [tree] = extractTrees(state)

    expect(tree.root.data.val).toEqual(intVar(2))
    expect(tree.root.edges.map((e) => e.fieldName)).toEqual(['left', 'right'])
    expect(tree.root.edges[0].child?.data.val).toEqual(intVar(1))
    expect(tree.root.edges[1].child?.data.val).toEqual(intVar(3))
    expect(tree.root.edges[0].child?.edges.every((e) => e.child === null)).toBe(true)
    expect(tree.pointers).toEqual([{ name: 'root', objectId: root.objectId }])
  })

  it('does not treat a single-pointer object (linked-list-shaped) as a tree', () => {
    const listNode: VariableValue = {
      kind: 'object',
      type: 'ListNode',
      repr: '<ListNode>',
      objectId: nextObjectId++,
      attributes: { val: intVar(1), next: NONE },
    }
    expect(extractTrees(moduleState({ head: listNode }))).toEqual([])
  })

  it('attaches a variable pointing into an existing tree as a named pointer instead of a new tree', () => {
    const leaf = treeNode(4, NONE, NONE)
    const root = treeNode(2, leaf, NONE)
    const state = moduleState({ root, node: leaf })

    const trees = extractTrees(state)
    expect(trees).toHaveLength(1)

    const pointerNames = trees[0].pointers.map((p) => p.name).sort()
    expect(pointerNames).toEqual(['node', 'root'])
    expect(trees[0].pointers.find((p) => p.name === 'node')?.objectId).toBe(leaf.objectId)
  })

  it('returns nothing when there are no tree-shaped objects', () => {
    expect(extractTrees(moduleState({ x: intVar(1) }))).toEqual([])
  })
})
