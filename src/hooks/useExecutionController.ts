import { useEffect, useState } from 'react'
import type { ExecutionStep, ExecutionTrace } from '../engine/trace'

export type PlaybackSpeed = 1 | 2 | 4

export interface ExecutionController {
  stepIndex: number
  totalSteps: number
  currentStep: ExecutionStep | null
  previousStep: ExecutionStep | null
  isPlaying: boolean
  speed: PlaybackSpeed
  canStepBack: boolean
  canStepForward: boolean
  reset: () => void
  stepForward: () => void
  stepBackward: () => void
  play: () => void
  pause: () => void
  setSpeed: (speed: PlaybackSpeed) => void
}

const BASE_DELAY_MS = 600

/**
 * Drives a cursor over an ExecutionTrace's immutable step list. Each step is
 * an existing snapshot from the trace, so "navigation" is just moving an
 * index — no re-execution, no re-derivation.
 */
export function useExecutionController(
  trace: ExecutionTrace | null,
): ExecutionController {
  const steps = trace?.steps ?? []
  const [stepIndex, setStepIndex] = useState(steps.length > 0 ? 0 : -1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)

  // A new trace (or a cleared one) resets the cursor to the start. Adjusting
  // state during render (rather than in an effect) avoids an extra commit.
  const [prevTrace, setPrevTrace] = useState(trace)
  if (trace !== prevTrace) {
    setPrevTrace(trace)
    setStepIndex(steps.length > 0 ? 0 : -1)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (!isPlaying) return
    if (stepIndex >= steps.length - 1) return
    const timer = setTimeout(() => {
      setStepIndex((i) => {
        const next = Math.min(i + 1, steps.length - 1)
        if (next >= steps.length - 1) setIsPlaying(false)
        return next
      })
    }, BASE_DELAY_MS / speed)
    return () => clearTimeout(timer)
  }, [isPlaying, stepIndex, speed, steps.length])

  return {
    stepIndex,
    totalSteps: steps.length,
    currentStep: stepIndex >= 0 ? (steps[stepIndex] ?? null) : null,
    previousStep: stepIndex > 0 ? (steps[stepIndex - 1] ?? null) : null,
    isPlaying,
    speed,
    canStepBack: stepIndex > 0,
    canStepForward: stepIndex < steps.length - 1,
    reset: () => {
      setIsPlaying(false)
      setStepIndex(steps.length > 0 ? 0 : -1)
    },
    stepForward: () => {
      setIsPlaying(false)
      setStepIndex((i) => Math.min(i + 1, steps.length - 1))
    },
    stepBackward: () => {
      setIsPlaying(false)
      setStepIndex((i) => Math.max(i - 1, 0))
    },
    play: () => {
      if (stepIndex < steps.length - 1) setIsPlaying(true)
    },
    pause: () => setIsPlaying(false),
    setSpeed,
  }
}
