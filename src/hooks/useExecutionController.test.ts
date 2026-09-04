import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useExecutionController } from './useExecutionController'
import type { ExecutionStep, ExecutionTrace } from '../engine/trace'

function makeStep(stepNumber: number, lineNumber: number): ExecutionStep {
  return {
    stepNumber,
    lineNumber,
    eventType: 'line',
    state: { lineNumber, stack: [], globals: {} },
  }
}

function makeTrace(stepCount: number): ExecutionTrace {
  return {
    language: 'python',
    steps: Array.from({ length: stepCount }, (_, i) => makeStep(i + 1, i + 1)),
  }
}

describe('useExecutionController', () => {
  it('starts at the first step when a trace is provided', () => {
    const { result } = renderHook(() => useExecutionController(makeTrace(3)))
    expect(result.current.stepIndex).toBe(0)
    expect(result.current.totalSteps).toBe(3)
    expect(result.current.currentStep?.lineNumber).toBe(1)
    expect(result.current.canStepBack).toBe(false)
    expect(result.current.canStepForward).toBe(true)
  })

  it('has no current step when there is no trace', () => {
    const { result } = renderHook(() => useExecutionController(null))
    expect(result.current.stepIndex).toBe(-1)
    expect(result.current.currentStep).toBeNull()
  })

  it('steps forward and backward without exceeding bounds', () => {
    const trace = makeTrace(2)
    const { result } = renderHook(() => useExecutionController(trace))

    act(() => result.current.stepForward())
    expect(result.current.stepIndex).toBe(1)
    expect(result.current.canStepForward).toBe(false)

    act(() => result.current.stepForward())
    expect(result.current.stepIndex).toBe(1) // clamped at the last step

    act(() => result.current.stepBackward())
    expect(result.current.stepIndex).toBe(0)

    act(() => result.current.stepBackward())
    expect(result.current.stepIndex).toBe(0) // clamped at the first step
  })

  it('reset returns the cursor to the first step', () => {
    const trace = makeTrace(3)
    const { result } = renderHook(() => useExecutionController(trace))
    act(() => result.current.stepForward())
    act(() => result.current.stepForward())
    expect(result.current.stepIndex).toBe(2)

    act(() => result.current.reset())
    expect(result.current.stepIndex).toBe(0)
  })

  it('resets the cursor when a new trace replaces the old one', () => {
    const { result, rerender } = renderHook(
      ({ trace }: { trace: ExecutionTrace | null }) => useExecutionController(trace),
      { initialProps: { trace: makeTrace(3) } },
    )
    act(() => result.current.stepForward())
    expect(result.current.stepIndex).toBe(1)

    rerender({ trace: makeTrace(5) })
    expect(result.current.stepIndex).toBe(0)
    expect(result.current.totalSteps).toBe(5)
  })

  it('play advances steps automatically and stops at the end', async () => {
    const trace = makeTrace(2)
    const { result } = renderHook(() => useExecutionController(trace))

    act(() => result.current.play())
    expect(result.current.isPlaying).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 700))

    expect(result.current.stepIndex).toBe(1)
    expect(result.current.isPlaying).toBe(false)
  })
})
