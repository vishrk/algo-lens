import type { Language } from '../lib/languages'
import type { ExecutionTrace } from './trace'
import { runPython } from './python/runPython'

export function runCode(language: Language, code: string): Promise<ExecutionTrace> {
  if (language === 'python') {
    return runPython(code)
  }
  return Promise.reject(
    new Error(`Execution for ${language} is not implemented yet.`),
  )
}
