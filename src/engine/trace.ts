export type ExecutionEventType = 'call' | 'line' | 'return' | 'exception'

export type VariableValue =
  | { kind: 'primitive'; type: string; value: string | number | boolean | null }
  | { kind: 'list'; type: string; items: VariableValue[] }
  | { kind: 'dict'; type: string; entries: [VariableValue, VariableValue][] }
  | { kind: 'object'; type: string; repr: string }

export interface StackFrameSnapshot {
  functionName: string
  lineNumber: number
  locals: Record<string, VariableValue>
}

export interface ExecutionState {
  lineNumber: number
  stack: StackFrameSnapshot[]
  globals: Record<string, VariableValue>
}

export interface ExecutionStep {
  stepNumber: number
  lineNumber: number
  eventType: ExecutionEventType
  state: ExecutionState
  returnValue?: VariableValue
}

export interface ExecutionError {
  type: string
  message: string
  lineNumber?: number
}

export interface ExecutionTrace {
  language: string
  steps: ExecutionStep[]
  finalState?: ExecutionState
  stdout?: string
  error?: ExecutionError
}
