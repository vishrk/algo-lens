import { describe, expect, it } from 'vitest'
import { extractGraphs } from './graphVariables'
import type { ExecutionState, VariableValue } from './trace'

function intVar(value: number): VariableValue {
  return { kind: 'primitive', type: 'int', value }
}

function listVar(items: VariableValue[]): VariableValue {
  return { kind: 'list', type: 'list', items }
}

function dictVar(entries: [VariableValue, VariableValue][]): VariableValue {
  return { kind: 'dict', type: 'dict', entries }
}

function moduleState(globals: Record<string, VariableValue>): ExecutionState {
  return { lineNumber: 1, stack: [{ functionName: '<module>', lineNumber: 1, locals: {} }], globals }
}

const SQUARE_GRAPH: [VariableValue, VariableValue][] = [
  [intVar(0), listVar([intVar(1), intVar(2)])],
  [intVar(1), listVar([intVar(0), intVar(3)])],
  [intVar(2), listVar([intVar(0), intVar(3)])],
  [intVar(3), listVar([intVar(1), intVar(2)])],
]

describe('extractGraphs', () => {
  it('collects all node ids and builds directed edges from an adjacency dict', () => {
    const state = moduleState({ graph: dictVar(SQUARE_GRAPH) })
    const [graph] = extractGraphs(state)

    expect(graph.nodeIds.sort()).toEqual(['0', '1', '2', '3'])
    expect(graph.edges).toHaveLength(8)
    expect(graph.edges).toContainEqual({ from: '0', to: '1' })
    expect(graph.edges).toContainEqual({ from: '1', to: '0' })
  })

  it('detects a scalar variable matching a node id as a "current node" pointer', () => {
    const state = moduleState({ graph: dictVar(SQUARE_GRAPH), node: intVar(2) })
    const [graph] = extractGraphs(state)
    expect(graph.pointers).toEqual([{ name: 'node', nodeId: '2' }])
  })

  it('does not treat an out-of-range int as a pointer', () => {
    const state = moduleState({ graph: dictVar(SQUARE_GRAPH), count: intVar(99) })
    const [graph] = extractGraphs(state)
    expect(graph.pointers).toEqual([])
  })

  it('labels a list/set of node ids as a named collection, whatever it is called', () => {
    const state = moduleState({
      graph: dictVar(SQUARE_GRAPH),
      visited: listVar([intVar(0), intVar(1)]),
      queue: listVar([intVar(2), intVar(3)]),
    })
    const [graph] = extractGraphs(state)

    const byName = Object.fromEntries(graph.collections.map((c) => [c.name, c.nodeIds]))
    expect(byName.visited).toEqual(['0', '1'])
    expect(byName.queue).toEqual(['2', '3'])
  })

  it('does not treat a list containing a non-node value as a node collection', () => {
    const state = moduleState({
      graph: dictVar(SQUARE_GRAPH),
      mixed: listVar([intVar(0), intVar(999)]),
    })
    const [graph] = extractGraphs(state)
    expect(graph.collections).toEqual([])
  })

  it('returns nothing for a dict that is not adjacency-shaped', () => {
    const notAGraph = dictVar([[intVar(1), intVar(2)]]) // values are ints, not lists
    expect(extractGraphs(moduleState({ counts: notAGraph }))).toEqual([])
  })

  it('returns nothing when there is no adjacency dict in scope', () => {
    expect(extractGraphs(moduleState({ x: intVar(1) }))).toEqual([])
  })
})
