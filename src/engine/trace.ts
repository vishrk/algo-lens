export type ExecutionEventType = 'call' | 'line' | 'return' | 'exception'

export type VariableValue =
  | { kind: 'primitive'; type: string; value: string | number | boolean | null }
  | { kind: 'list'; type: string; items: VariableValue[] }
  | { kind: 'dict'; type: string; entries: [VariableValue, VariableValue][] }
  | {
      kind: 'object'
      type: string
      repr: string
      /** Identity of the underlying instance (CPython's id()) — present for
       *  user-defined class instances, absent for opaque objects (functions,
       *  modules, ...) and for the "<circular>" sentinel. Lets visualizers
       *  recognize shared/repeated references, e.g. a linked-list cycle. */
      objectId?: number
      /** The instance's real fields, present alongside objectId. Absent for
       *  opaque objects, which only carry a repr. */
      attributes?: Record<string, VariableValue>
    }

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
