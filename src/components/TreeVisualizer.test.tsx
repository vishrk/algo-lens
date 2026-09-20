import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TreeVisualizer } from './TreeVisualizer'
import type { ExecutionState, VariableValue } from '../engine/trace'

let nextObjectId = 1

function intVar(value: number): VariableValue {
  return { kind: 'primitive', type: 'int', value }
}

const NONE: VariableValue = { kind: 'primitive', type: 'NoneType', value: null }

function treeNode(val: number, left: VariableValue, right: VariableValue): VariableValue {
  return {
    kind: 'object',
    type: 'TreeNode',
    repr: `<TreeNode val=${val}>`,
    objectId: nextObjectId++,
    attributes: { val: intVar(val), left, right },
  }
}

function state(globals: Record<string, VariableValue>): ExecutionState {
  return { lineNumber: 1, stack: [], globals }
}

describe('TreeVisualizer', () => {
  it('renders nothing when there is no state', () => {
    const { container } = render(<TreeVisualizer state={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when scope has no tree-shaped objects', () => {
    const { container } = render(<TreeVisualizer state={state({ x: intVar(1) })} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders node values, field-labeled edges, null leaves, and a pointer label', () => {
    const left = treeNode(1, NONE, NONE)
    const right = treeNode(3, NONE, NONE)
    const root = treeNode(2, left, right)

    render(<TreeVisualizer state={state({ root })} />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('root')).toBeInTheDocument()
    expect(screen.getAllByText('left: null')).toHaveLength(2)
    expect(screen.getAllByText('right: null')).toHaveLength(2)
  })
})
