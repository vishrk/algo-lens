import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VariablesPanel } from './VariablesPanel'
import type { ExecutionStep } from '../engine/trace'

function step(
  lineNumber: number,
  globals: ExecutionStep['state']['globals'],
  stack: ExecutionStep['state']['stack'] = [],
): ExecutionStep {
  return {
    stepNumber: lineNumber,
    lineNumber,
    eventType: 'line',
    state: { lineNumber, stack, globals },
  }
}

describe('VariablesPanel', () => {
  it('shows a placeholder when there is no current step', () => {
    render(<VariablesPanel currentStep={null} previousStep={null} />)
    expect(
      screen.getByText('No variables yet — run and step through your code.'),
    ).toBeInTheDocument()
  })

  it('lists global variables with their type and value', () => {
    const current = step(3, {
      x: { kind: 'primitive', type: 'int', value: 10 },
      y: { kind: 'primitive', type: 'int', value: 20 },
    })
    render(<VariablesPanel currentStep={current} previousStep={null} />)

    expect(screen.getByText('x')).toBeInTheDocument()
    expect(screen.getByText('y')).toBeInTheDocument()
    expect(screen.getAllByText('int')).toHaveLength(2)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('marks a variable as changed when its value differs from the previous step', () => {
    const previous = step(1, { mid: { kind: 'primitive', type: 'int', value: 2 } })
    const current = step(2, { mid: { kind: 'primitive', type: 'int', value: 3 } })

    render(<VariablesPanel currentStep={current} previousStep={previous} />)

    expect(screen.getByText('mid')).toBeInTheDocument()
    expect(screen.getByText('previous: 2')).toBeInTheDocument()
  })

  it('does not mark a variable as changed when its value is unchanged', () => {
    const previous = step(1, { target: { kind: 'primitive', type: 'int', value: 9 } })
    const current = step(2, { target: { kind: 'primitive', type: 'int', value: 9 } })

    render(<VariablesPanel currentStep={current} previousStep={previous} />)

    expect(screen.getByText('target')).toBeInTheDocument()
    expect(screen.queryByText(/^previous:/)).not.toBeInTheDocument()
  })

  it('separates local variables (top stack frame) from globals', () => {
    const current = step(
      5,
      { two_sum: { kind: 'object', type: 'function', repr: '<function two_sum>' } },
      [
        {
          functionName: 'two_sum',
          lineNumber: 5,
          locals: { nums: { kind: 'list', type: 'list', items: [] } },
        },
      ],
    )
    render(<VariablesPanel currentStep={current} previousStep={null} />)

    expect(screen.getByText('Locals — two_sum')).toBeInTheDocument()
    expect(screen.getByText('nums')).toBeInTheDocument()
    expect(screen.getByText('Globals')).toBeInTheDocument()
    expect(screen.getByText('two_sum')).toBeInTheDocument()
  })
})
