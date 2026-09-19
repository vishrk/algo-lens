import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CallStackPanel } from './CallStackPanel'
import type { ExecutionStep } from '../engine/trace'

describe('CallStackPanel', () => {
  it('shows a placeholder when there is no current step', () => {
    render(<CallStackPanel currentStep={null} />)
    expect(
      screen.getByText('No call stack yet — run and step through your code.'),
    ).toBeInTheDocument()
  })

  it('renders frames innermost-first with their locals', () => {
    const step: ExecutionStep = {
      stepNumber: 1,
      lineNumber: 4,
      eventType: 'line',
      state: {
        lineNumber: 4,
        globals: {},
        stack: [
          { functionName: '<module>', lineNumber: 14, locals: {} },
          {
            functionName: 'binary_search',
            lineNumber: 4,
            locals: { left: { kind: 'primitive', type: 'int', value: 0 } },
          },
        ],
      },
    }
    render(<CallStackPanel currentStep={step} />)

    const frameNames = screen.getAllByText(/\(\)$/).map((el) => el.textContent)
    expect(frameNames).toEqual(['binary_search()', '<module>()'])
    expect(screen.getByText(/left/)).toBeInTheDocument()
    expect(screen.getByText('running')).toBeInTheDocument()
  })

  it('shows the return value on the innermost frame at a return event', () => {
    const step: ExecutionStep = {
      stepNumber: 9,
      lineNumber: 5,
      eventType: 'return',
      state: {
        lineNumber: 5,
        globals: {},
        stack: [
          { functionName: '<module>', lineNumber: 14, locals: {} },
          { functionName: 'binary_search', lineNumber: 5, locals: {} },
        ],
      },
      returnValue: { kind: 'primitive', type: 'int', value: 2 },
    }
    render(<CallStackPanel currentStep={step} />)

    expect(screen.getByText('returned')).toBeInTheDocument()
    expect(screen.getByText('→ 2')).toBeInTheDocument()
  })
})
