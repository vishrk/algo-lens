import { describe, expect, it } from 'vitest'
import { extractArrayVariables } from './arrayVariables'
import type { ExecutionState, VariableValue } from './trace'

function intVar(value: number): VariableValue {
  return { kind: 'primitive', type: 'int', value }
}

function listVar(values: number[]): VariableValue {
  return { kind: 'list', type: 'list', items: values.map(intVar) }
}

function moduleState(globals: Record<string, VariableValue>): ExecutionState {
  return { lineNumber: 1, stack: [{ functionName: '<module>', lineNumber: 1, locals: {} }], globals }
}

function frameState(
  globals: Record<string, VariableValue>,
  locals: Record<string, VariableValue>,
  functionName = 'binary_search',
): ExecutionState {
  return {
    lineNumber: 1,
    stack: [
      { functionName: '<module>', lineNumber: 1, locals: {} },
      { functionName, lineNumber: 1, locals },
    ],
    globals,
  }
}

describe('extractArrayVariables', () => {
  it('finds list variables and reports no changes without a previous state', () => {
    const state = moduleState({ nums: listVar([2, 7, 11, 15]) })
    const [array] = extractArrayVariables(state)

    expect(array.name).toBe('nums')
    expect(array.items).toHaveLength(4)
    expect(array.changedIndices.size).toBe(0)
    expect(array.lengthChanged).toBe(false)
  })

  it('detects an integer variable as a pointer only when it is a valid index', () => {
    const state = frameState({}, {
      nums: listVar([1, 3, 5, 7, 9, 11]),
      left: intVar(0),
      right: intVar(5),
      mid: intVar(2),
      target: intVar(999), // out of range — not a valid index, should not be a pointer
    })
    const [array] = extractArrayVariables(state)

    const pointerNames = array.pointers.map((p) => p.name).sort()
    expect(pointerNames).toEqual(['left', 'mid', 'right'])
    expect(array.pointers.find((p) => p.name === 'mid')?.index).toBe(2)
  })

  it('reports changed indices by diffing against the previous state', () => {
    const previous = moduleState({ nums: listVar([1, 3, 5, 7]) })
    const current = moduleState({ nums: listVar([1, 3, 99, 7]) })

    const [array] = extractArrayVariables(current, previous)
    expect([...array.changedIndices]).toEqual([2])
  })

  it('flags a length change without guessing which index was inserted or removed', () => {
    const previous = moduleState({ nums: listVar([1, 2, 3]) })
    const current = moduleState({ nums: listVar([1, 2, 3, 4]) })

    const [array] = extractArrayVariables(current, previous)
    expect(array.lengthChanged).toBe(true)
  })

  it('prefers a local variable over a global with the same name (Python scoping)', () => {
    const state = frameState(
      { nums: listVar([0, 0, 0]) },
      { nums: listVar([9, 9, 9]) },
    )
    const [array] = extractArrayVariables(state)
    expect(array.items.map((v) => (v as { value: number }).value)).toEqual([9, 9, 9])
  })

  it('returns an empty array when there are no list variables', () => {
    const state = moduleState({ x: intVar(5) })
    expect(extractArrayVariables(state)).toEqual([])
  })
})
