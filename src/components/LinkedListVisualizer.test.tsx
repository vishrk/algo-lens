import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LinkedListVisualizer } from './LinkedListVisualizer'
import type { ExecutionState, VariableValue } from '../engine/trace'

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

function state(globals: Record<string, VariableValue>): ExecutionState {
  return { lineNumber: 1, stack: [], globals }
}

describe('LinkedListVisualizer', () => {
  it('renders nothing when there is no state', () => {
    const { container } = render(<LinkedListVisualizer state={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when scope has no list-like objects', () => {
    const { container } = render(
      <LinkedListVisualizer state={state({ x: intVar(1) })} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders each node value, a pointer label, and a terminating null', () => {
    const n2 = node(2, NONE)
    const n1 = node(1, n2)
    render(<LinkedListVisualizer state={state({ head: n1 })} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('head ↓')).toBeInTheDocument()
    expect(screen.getByText('null')).toBeInTheDocument()
  })

  it('shows a cycle marker instead of null when the chain loops', () => {
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

    render(<LinkedListVisualizer state={state({ a })} />)
    expect(screen.getByText('⟲ (cycle)')).toBeInTheDocument()
  })
})
