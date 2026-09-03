import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Workspace } from './Workspace'
import { runCode } from '../engine/runEngine'
import type { ExecutionTrace } from '../engine/trace'

vi.mock('../engine/runEngine', () => ({
  runCode: vi.fn(),
}))

describe('Workspace', () => {
  it('shows the trace summary after Run resolves', async () => {
    const trace: ExecutionTrace = {
      language: 'python',
      steps: [
        {
          stepNumber: 1,
          lineNumber: 1,
          eventType: 'line',
          state: { lineNumber: 1, stack: [], globals: {} },
        },
      ],
      stdout: '30\n',
      finalState: {
        lineNumber: 1,
        stack: [],
        globals: { z: { kind: 'primitive', type: 'int', value: 30 } },
      },
    }
    vi.mocked(runCode).mockResolvedValue(trace)

    const user = userEvent.setup()
    render(<Workspace />)

    expect(screen.getByText('Press Run to execute your code')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Run' }))

    expect(await screen.findByText('1 execution step recorded')).toBeInTheDocument()
    expect(screen.getByText('z')).toBeInTheDocument()
  })

  it('surfaces a run error', async () => {
    vi.mocked(runCode).mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(<Workspace />)

    await user.click(screen.getByRole('button', { name: 'Run' }))

    expect(await screen.findByText('boom')).toBeInTheDocument()
  })

  it('resets the trace state', async () => {
    const trace: ExecutionTrace = {
      language: 'python',
      steps: [
        {
          stepNumber: 1,
          lineNumber: 1,
          eventType: 'line',
          state: { lineNumber: 1, stack: [], globals: {} },
        },
      ],
    }
    vi.mocked(runCode).mockResolvedValue(trace)

    const user = userEvent.setup()
    render(<Workspace />)

    await user.click(screen.getByRole('button', { name: 'Run' }))
    expect(await screen.findByText('1 execution step recorded')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('Press Run to execute your code')).toBeInTheDocument()
  })

  it('lists the DSA examples in the example selector', () => {
    render(<Workspace />)
    expect(screen.getByRole('option', { name: 'Two Sum' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Binary Search' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Reverse Linked List' }),
    ).toBeInTheDocument()
  })
})
