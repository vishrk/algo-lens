import { activeScope } from './scope'
import type { ExecutionState, VariableValue } from './trace'

export interface GraphEdge {
  from: string
  to: string
}

export interface GraphPointer {
  name: string
  nodeId: string
}

export interface GraphCollection {
  name: string
  nodeIds: string[]
}

export interface GraphVariable {
  name: string
  nodeIds: string[]
  edges: GraphEdge[]
  pointers: GraphPointer[]
  collections: GraphCollection[]
}

type DictValue = Extract<VariableValue, { kind: 'dict' }>
type ListValue = Extract<VariableValue, { kind: 'list' }>

function isDict(value: VariableValue): value is DictValue {
  return value.kind === 'dict'
}

function isList(value: VariableValue): value is ListValue {
  return value.kind === 'list'
}

/** A node id is a plain int or string — the values graph keys/labels use. */
function nodeKey(value: VariableValue): string | null {
  if (value.kind !== 'primitive') return null
  if (value.type !== 'int' && value.type !== 'str') return null
  return String(value.value)
}

/** An adjacency dict: a non-empty dict whose every value is a list of neighbors. */
function isAdjacencyDict(value: VariableValue): value is DictValue {
  return isDict(value) && value.entries.length > 0 && value.entries.every(([, v]) => isList(v))
}

function collectNodeIds(adjacency: DictValue): Set<string> {
  const ids = new Set<string>()
  for (const [key, neighbors] of adjacency.entries) {
    const k = nodeKey(key)
    if (k !== null) ids.add(k)
    if (isList(neighbors)) {
      for (const neighbor of neighbors.items) {
        const nk = nodeKey(neighbor)
        if (nk !== null) ids.add(nk)
      }
    }
  }
  return ids
}

function buildEdges(adjacency: DictValue): GraphEdge[] {
  const edges: GraphEdge[] = []
  for (const [key, neighbors] of adjacency.entries) {
    const from = nodeKey(key)
    if (from === null || !isList(neighbors)) continue
    for (const neighbor of neighbors.items) {
      const to = nodeKey(neighbor)
      if (to !== null) edges.push({ from, to })
    }
  }
  return edges
}

/**
 * Finds adjacency-dict-shaped variables (`{node: [neighbors, ...]}`) and, for
 * every other variable in scope:
 *  - a scalar (int/str) whose value equals a known node id becomes a
 *    "current node" pointer, the same coincidence-based heuristic
 *    ArrayVisualizer uses for index pointers;
 *  - a list/set whose *every* element is a known node id becomes a named
 *    collection (whatever the user called it — `visited`, `queue`, `stack`,
 *    `order`, ...), shown under its own real name rather than guessed at.
 * No assumption is made about which collection means "visited" vs "queue"
 * vs "stack" — that's exactly what the variable's own name already says.
 */
export function extractGraphs(state: ExecutionState): GraphVariable[] {
  const scope = activeScope(state)
  const graphEntries = Object.entries(scope).filter(
    (entry): entry is [string, DictValue] => isAdjacencyDict(entry[1]),
  )

  return graphEntries.map(([name, adjacency]) => {
    const nodeIdSet = collectNodeIds(adjacency)
    const edges = buildEdges(adjacency)

    const pointers: GraphPointer[] = []
    const collections: GraphCollection[] = []

    for (const [varName, value] of Object.entries(scope)) {
      if (varName === name) continue

      const scalarId = nodeKey(value)
      if (scalarId !== null && nodeIdSet.has(scalarId)) {
        pointers.push({ name: varName, nodeId: scalarId })
        continue
      }

      if (isList(value) && value.items.length > 0) {
        const ids = value.items.map(nodeKey)
        if (ids.every((id): id is string => id !== null && nodeIdSet.has(id))) {
          collections.push({ name: varName, nodeIds: ids })
        }
      }
    }

    return { name, nodeIds: [...nodeIdSet], edges, pointers, collections }
  })
}
