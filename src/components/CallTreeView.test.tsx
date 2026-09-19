import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CallTreeView } from './CallTreeView'
import type { ExecutionStep, VariableValue } from '../engine/trace'

function intVar(value: number): VariableValue {
  return { kind: 'primitive', type: 'int', value }
}

function step(
  eventType: ExecutionStep['eventType'],
  functionName: string,
  locals: Record<string, VariableValue> = {},
  returnValue?: VariableValue,
): ExecutionStep {
  return {
    stepNumber: 1,
    lineNumber: 1,
    eventType,
    state: {
      lineNumber: 1,
      globals: {},
      stack: [
        { functionName: '<module>', lineNumber: 1, locals: {} },
        { functionName, lineNumber: 1, locals },
      ],
    },
    returnValue,
  }
}

describe('CallTreeView', () => {
  it('renders nothing for a single flat call (no branching)', () => {
    const steps = [step('call', 'two_sum', {}), step('return', 'two_sum', {}, intVar(0))]
    const { container } = render(<CallTreeView steps={steps} stepIndex={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a branching call tree with args and return values', () => {
    const steps: ExecutionStep[] = [
      step('call', 'fib', { n: intVar(2) }),
      step('call', 'fib', { n: intVar(1) }),
      step('return', 'fib', { n: intVar(1) }, intVar(1)),
      step('call', 'fib', { n: intVar(0) }),
      step('return', 'fib', { n: intVar(0) }, intVar(0)),
      step('return', 'fib', { n: intVar(2) }, intVar(1)),
    ]

    render(<CallTreeView steps={steps} stepIndex={0} />)

    expect(screen.getByText('Call Tree')).toBeInTheDocument()
    expect(screen.getByText(/fib\(n=2\)/)).toBeInTheDocument()
    expect(screen.getByText(/fib\(n=1\)/)).toBeInTheDocument()
    expect(screen.getByText(/fib\(n=0\)/)).toBeInTheDocument()
    expect(screen.getAllByText(/→/).length).toBeGreaterThan(0)
  })
})
