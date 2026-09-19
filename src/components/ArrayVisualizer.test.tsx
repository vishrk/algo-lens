import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArrayVisualizer } from './ArrayVisualizer'
import type { ExecutionState, VariableValue } from '../engine/trace'

function intVar(value: number): VariableValue {
  return { kind: 'primitive', type: 'int', value }
}

function listVar(values: number[]): VariableValue {
  return { kind: 'list', type: 'list', items: values.map(intVar) }
}

function state(globals: Record<string, VariableValue>): ExecutionState {
  return { lineNumber: 1, stack: [], globals }
}

describe('ArrayVisualizer', () => {
  it('renders nothing when there is no current state', () => {
    const { container } = render(<ArrayVisualizer state={null} previousState={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the scope has no array variables', () => {
    const { container } = render(
      <ArrayVisualizer state={state({ x: intVar(1) })} previousState={null} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders array cells, indexes, and a pointer label', () => {
    render(
      <ArrayVisualizer
        state={state({ nums: listVar([1, 3, 5, 7]), mid: intVar(2) })}
        previousState={null}
      />,
    )

    expect(screen.getByText('nums')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('↑ mid')).toBeInTheDocument()
  })

  it('marks a cell as changed when its value differs from the previous step', () => {
    const previous = state({ nums: listVar([1, 3, 5, 7]) })
    const current = state({ nums: listVar([1, 3, 99, 7]) })

    render(<ArrayVisualizer state={current} previousState={previous} />)

    expect(screen.getByText('99')).toHaveClass('border-accent')
  })
})
