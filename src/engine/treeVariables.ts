import { findPointerFields, isObjectValue, type ObjectValue } from './pointerFields'
import { activeScope } from './scope'
import type { ExecutionState, VariableValue } from './trace'

export interface TreeChildEdge {
  fieldName: string
  child: TreeNode | null
}

export interface TreeNode {
  objectId: number
  /** The node's own fields, excluding the two child-pointer fields. */
  data: Record<string, VariableValue>
  /** Always length 2, in the class's real attribute order (e.g. left, right). */
  edges: TreeChildEdge[]
}

export interface TreePointer {
  name: string
  objectId: number
}

export interface TreeVariable {
  root: TreeNode
  pointers: TreePointer[]
}

const MAX_NODES = 2000

function buildNode(
  value: ObjectValue,
  fields: [string, string],
  seen: Set<number>,
): TreeNode | null {
  if (value.objectId === undefined || !value.attributes) return null
  if (seen.has(value.objectId)) return null // malformed cycle guard — trees shouldn't have one
  seen.add(value.objectId)

  const attributes = value.attributes
  const data: Record<string, VariableValue> = {}
  for (const key of Object.keys(attributes)) {
    if (key !== fields[0] && key !== fields[1]) data[key] = attributes[key]
  }

  const edges: TreeChildEdge[] = fields.map((fieldName) => {
    const childValue = attributes[fieldName]
    const child =
      childValue && isObjectValue(childValue) ? buildNode(childValue, fields, seen) : null
    return { fieldName, child }
  })

  return { objectId: value.objectId, data, edges }
}

function collectObjectIds(node: TreeNode, out: Set<number>): void {
  out.add(node.objectId)
  if (out.size > MAX_NODES) return
  for (const edge of node.edges) {
    if (edge.child) collectObjectIds(edge.child, out)
  }
}

function findObjectId(node: TreeNode, objectId: number): boolean {
  if (node.objectId === objectId) return true
  return node.edges.some((edge) => edge.child !== null && findObjectId(edge.child, objectId))
}

/**
 * Finds binary-tree-shaped variables in scope: any object with exactly two
 * "pointer" fields (each either None or another instance of the same
 * class) — no assumption that they're named "left"/"right", though real
 * trees usually will be. As with arrays and linked lists, a variable that
 * points at a node already inside a discovered tree is attached as a named
 * pointer on that tree instead of being drawn as a separate one.
 */
export function extractTrees(state: ExecutionState): TreeVariable[] {
  const scope = activeScope(state)
  const candidates = Object.entries(scope).filter(
    (entry): entry is [string, ObjectValue] => isObjectValue(entry[1]) && entry[1].attributes !== undefined,
  )

  const trees: TreeVariable[] = []
  const claimed = new Set<number>()

  for (const [name, value] of candidates) {
    if (value.objectId !== undefined && claimed.has(value.objectId)) continue
    const fields = findPointerFields(value)
    if (fields.length !== 2) continue

    const root = buildNode(value, [fields[0], fields[1]], new Set())
    if (!root) continue

    const ids = new Set<number>()
    collectObjectIds(root, ids)
    ids.forEach((id) => claimed.add(id))

    trees.push({ root, pointers: [{ name, objectId: root.objectId }] })
  }

  for (const [name, value] of candidates) {
    if (value.objectId === undefined) continue
    if (trees.some((tree) => tree.pointers.some((p) => p.name === name))) continue
    for (const tree of trees) {
      if (findObjectId(tree.root, value.objectId)) {
        tree.pointers.push({ name, objectId: value.objectId })
        break
      }
    }
  }

  return trees
}
