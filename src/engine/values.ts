import type { VariableValue } from './trace'

export function valuesEqual(a: VariableValue, b: VariableValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
