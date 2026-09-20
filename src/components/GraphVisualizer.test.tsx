import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GraphVisualizer } from './GraphVisualizer'
import type { ExecutionState, VariableValue } from '../engine/trace'

function intVar(value: number): VariableValue {
  return { kind: 'primitive', type: 'int', value }
}

function listVar(items: VariableValue[]): VariableValue {
  return { kind: 'list', type: 'list', items }
}

function dictVar(entries: [VariableValue, VariableValue][]): VariableValue {
  return { kind: 'dict', type: 'dict', entries }
}

function state(globals: Record<string, VariableValue>): ExecutionState {
  return { lineNumber: 1, stack: [], globals }
}

const GRAPH: VariableValue = dictVar([
  [intVar(0), listVar([intVar(1)])],
  [intVar(1), listVar([intVar(0)])],
])

describe('GraphVisualizer', () => {
  it('renders nothing when there is no state', () => {
    const { container } = render(<GraphVisualizer state={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when scope has no adjacency-shaped dict', () => {
    const { container } = render(<GraphVisualizer state={state({ x: intVar(1) })} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nodes, edges, a current-node pointer, and a named collection', () => {
    render(
      <GraphVisualizer
        state={state({
          graph: GRAPH,
          node: intVar(1),
          visited: listVar([intVar(0)]),
        })}
      />,
    )

    expect(screen.getByText('graph')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('node ↓')).toBeInTheDocument()
    expect(screen.getByText('edges: 0→1, 1→0')).toBeInTheDocument()
    expect(screen.getByText('visited')).toBeInTheDocument()
    expect(screen.getByText(': [0]')).toBeInTheDocument()
  })
})
