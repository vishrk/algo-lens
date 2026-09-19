import type { ExecutionState, VariableValue } from './trace'

/**
 * The variables "in scope" at a given execution state: the innermost stack
 * frame's locals shadowing globals, matching Python name resolution. At
 * module scope, frame locals and globals are the same dict in CPython, so
 * globals alone already covers it.
 */
export function activeScope(state: ExecutionState): Record<string, VariableValue> {
  const frame = state.stack.at(-1)
  if (frame && frame.functionName !== '<module>') {
    return { ...state.globals, ...frame.locals }
  }
  return state.globals
}
