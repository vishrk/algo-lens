import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Workspace } from './Workspace'

describe('Workspace', () => {
  it('shows the run prompt before running, and switches after Run is clicked', async () => {
    const user = userEvent.setup()
    render(<Workspace />)

    expect(screen.getByText('Press Run to execute your code')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Run' }))

    expect(screen.getByText('Execution tracing lands in Phase 03')).toBeInTheDocument()
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
