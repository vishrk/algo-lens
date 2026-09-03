import type { VariableValue } from './trace'

export function formatValue(value: VariableValue): string {
  switch (value.kind) {
    case 'primitive':
      if (value.value === null) return 'None'
      return typeof value.value === 'string' ? `"${value.value}"` : String(value.value)
    case 'list':
      return `[${value.items.map(formatValue).join(', ')}]`
    case 'dict':
      return `{${value.entries
        .map(([k, v]) => `${formatValue(k)}: ${formatValue(v)}`)
        .join(', ')}}`
    case 'object':
      return value.repr
  }
}
