import type { VariableValue } from './trace'

export type ObjectValue = Extract<VariableValue, { kind: 'object' }>

export function isObjectValue(value: VariableValue): value is ObjectValue {
  return value.kind === 'object'
}

export function isNullPrimitive(value: VariableValue): boolean {
  return value.kind === 'primitive' && value.value === null
}

/**
 * Finds every attribute on a node that is structurally a "pointer to a peer
 * node": either None, or another instance of the same class. No field
 * names are assumed — this works for `next`, `left`/`right`, or anything
 * else a class happens to call them.
 *
 * The count distinguishes shape generically: exactly one such field means
 * singly-linked-list-like (Phase 09); exactly two means binary-tree-like
 * (Phase 10); any other count isn't a shape either of those phases models.
 */
export function findPointerFields(node: ObjectValue): string[] {
  if (!node.attributes) return []
  return Object.entries(node.attributes)
    .filter(([, value]) => isNullPrimitive(value) || (isObjectValue(value) && value.type === node.type))
    .map(([key]) => key)
}
