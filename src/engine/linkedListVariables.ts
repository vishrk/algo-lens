import { activeScope } from './scope'
import type { ExecutionState, VariableValue } from './trace'

type ObjectValue = Extract<VariableValue, { kind: 'object' }>

export interface LinkedListPointer {
  name: string
  nodeIndex: number
}

export interface LinkedListNode {
  objectId: number
  /** The node's own fields, excluding whichever field is the "next" pointer. */
  data: Record<string, VariableValue>
}

export interface LinkedListChain {
  nextField: string
  nodes: LinkedListNode[]
  /** True when walking .next eventually loops back onto an earlier node. */
  hasCycle: boolean
  pointers: LinkedListPointer[]
}

function isObject(value: VariableValue): value is ObjectValue {
  return value.kind === 'object'
}

function isNullPrimitive(value: VariableValue): boolean {
  return value.kind === 'primitive' && value.value === null
}

/**
 * A "next" field is any attribute whose value is either None or another
 * instance of the same class. Exactly one such field means the object is
 * list-like (a node with a single successor); zero means it's not part of a
 * chain; two or more (e.g. a tree's left/right, or a doubly-linked prev+next)
 * means it isn't a *singly* linked list, so it's left for later phases.
 */
function findNextField(node: ObjectValue): string | null {
  if (!node.attributes) return null
  const candidates = Object.entries(node.attributes).filter(
    ([, value]) => isNullPrimitive(value) || (isObject(value) && value.type === node.type),
  )
  return candidates.length === 1 ? candidates[0][0] : null
}

const MAX_CHAIN_LENGTH = 500

function walkChain(head: ObjectValue, nextField: string): { nodes: LinkedListNode[]; hasCycle: boolean } {
  const nodes: LinkedListNode[] = []
  const seen = new Set<number>()
  let current: VariableValue = head
  let hasCycle = false

  for (;;) {
    if (!isObject(current) || current.objectId === undefined || !current.attributes) break
    const objectId: number = current.objectId
    const attributes: Record<string, VariableValue> = current.attributes

    if (seen.has(objectId)) {
      hasCycle = true
      break
    }
    seen.add(objectId)

    const next: VariableValue | undefined = attributes[nextField]
    const data: Record<string, VariableValue> = {}
    for (const key of Object.keys(attributes)) {
      if (key !== nextField) data[key] = attributes[key]
    }
    nodes.push({ objectId, data })

    if (nodes.length >= MAX_CHAIN_LENGTH) break
    if (next === undefined) break
    if (isObject(next) && next.objectId === undefined) {
      // The serializer's own cycle guard truncated here (repr "<circular>")
      // before we could see the identity — still real evidence of a cycle.
      hasCycle = next.repr === '<circular>'
      break
    }
    current = next
  }

  return { nodes, hasCycle }
}

/**
 * Finds singly-linked-list-shaped variables in scope and renders every
 * pointer variable that references a node already in some chain as a label
 * on that chain, rather than drawing the same nodes again — so `head`,
 * `curr`, `prev` sharing a list show up as one visualization, not three.
 */
export function extractLinkedLists(state: ExecutionState): LinkedListChain[] {
  const scope = activeScope(state)
  const candidates = Object.entries(scope).filter(
    (entry): entry is [string, ObjectValue] => isObject(entry[1]) && entry[1].attributes !== undefined,
  )

  const chains: LinkedListChain[] = []
  const claimed = new Set<number>()

  for (const [name, value] of candidates) {
    if (value.objectId !== undefined && claimed.has(value.objectId)) continue
    const nextField = findNextField(value)
    if (!nextField) continue

    const { nodes, hasCycle } = walkChain(value, nextField)
    if (nodes.length === 0) continue

    nodes.forEach((node) => claimed.add(node.objectId))
    chains.push({ nextField, nodes, hasCycle, pointers: [{ name, nodeIndex: 0 }] })
  }

  for (const [name, value] of candidates) {
    if (value.objectId === undefined) continue
    if (chains.some((chain) => chain.pointers.some((p) => p.name === name))) continue
    for (const chain of chains) {
      const nodeIndex = chain.nodes.findIndex((n) => n.objectId === value.objectId)
      if (nodeIndex !== -1) {
        chain.pointers.push({ name, nodeIndex })
        break
      }
    }
  }

  return chains
}
