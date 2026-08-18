import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the AlgoLens shell', () => {
    render(<App />)
    expect(screen.getByText('AlgoLens')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
    expect(screen.getByText('Visualization')).toBeInTheDocument()
  })
})
