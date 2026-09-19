import { activeScope } from './scope'
import type { ExecutionState, VariableValue } from './trace'
import { valuesEqual } from './values'

export interface ArrayPointer {
  name: string
  index: number
}

export interface ArrayVariable {
  name: string
  items: VariableValue[]
  pointers: ArrayPointer[]
  changedIndices: Set<number>
  lengthChanged: boolean
}

type ListValue = Extract<VariableValue, { kind: 'list' }>
type PrimitiveValue = Extract<VariableValue, { kind: 'primitive' }>

function isList(value: VariableValue): value is ListValue {
  return value.kind === 'list'
}

function isIntPrimitive(value: VariableValue): value is PrimitiveValue {
  return value.kind === 'primitive' && value.type === 'int'
}

/**
 * Finds array-like (list) variables in scope and, generically, any integer
 * variable whose value happens to be a valid index into that array — no
 * knowledge of variable names like "left" or "mid" is used. Change
 * detection is a plain per-index diff against the previous step's state,
 * so it only reports what actually differs, never a fabricated "read".
 */
export function extractArrayVariables(
  current: ExecutionState,
  previous?: ExecutionState | null,
): ArrayVariable[] {
  const scope = activeScope(current)
  const previousScope = previous ? activeScope(previous) : undefined

  const arrayEntries = Object.entries(scope).filter((entry): entry is [string, ListValue] =>
    isList(entry[1]),
  )
  const indexCandidates = Object.entries(scope).filter(
    (entry): entry is [string, PrimitiveValue] => isIntPrimitive(entry[1]),
  )

  return arrayEntries.map(([name, value]) => {
    const items = value.items
    const previousValue = previousScope?.[name]
    const previousItems = previousValue && isList(previousValue) ? previousValue.items : undefined

    const changedIndices = new Set<number>()
    if (previousItems) {
      items.forEach((item, i) => {
        const prevItem = previousItems[i]
        if (!prevItem || !valuesEqual(item, prevItem)) changedIndices.add(i)
      })
    }

    const pointers: ArrayPointer[] = indexCandidates
      .filter(([pointerName]) => pointerName !== name)
      .map(([pointerName, pointerValue]) => ({
        name: pointerName,
        index: pointerValue.value as number,
      }))
      .filter((pointer) => pointer.index >= 0 && pointer.index < items.length)

    return {
      name,
      items,
      pointers,
      changedIndices,
      lengthChanged: previousItems !== undefined && previousItems.length !== items.length,
    }
  })
}
