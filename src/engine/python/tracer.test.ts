// @vitest-environment node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPyodide, type PyodideInterface } from 'pyodide'
import { beforeAll, describe, expect, it } from 'vitest'

const tracerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'tracer.py'),
  'utf-8',
)

let pyodide: PyodideInterface

beforeAll(async () => {
  pyodide = await loadPyodide()
  pyodide.runPython(tracerSource)
}, 60000)

function trace(code: string) {
  pyodide.globals.set('__algolens_source__', code)
  const resultJson: string = pyodide.runPython(
    'import json\njson.dumps(trace_code(__algolens_source__, {"__name__": "__main__"}))',
  )
  return JSON.parse(resultJson)
}

describe('python tracer (real Pyodide execution)', () => {
  it('produces a real execution trace for a simple program', () => {
    const result = trace('x = 10\ny = 20\nz = x + y\nprint(z)\n')

    expect(result.error).toBeNull()
    expect(result.stdout).toBe('30\n')
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps.at(-1).state.globals.z).toEqual({
      kind: 'primitive',
      type: 'int',
      value: 30,
    })
  })

  it('captures a runtime error with its line number', () => {
    const result = trace('x = 1\ny = x / 0\n')

    expect(result.error.type).toBe('ZeroDivisionError')
    expect(result.error.lineNumber).toBe(2)
  })

  it('traces function calls with a call stack', () => {
    const result = trace('def add(a, b):\n    return a + b\n\nresult = add(2, 3)\n')

    const callStep = result.steps.find(
      (step: { eventType: string; state: { stack: { functionName: string }[] } }) =>
        step.eventType === 'call' &&
        step.state.stack.some((frame) => frame.functionName === 'add'),
    )
    expect(callStep).toBeDefined()

    const returnStep = result.steps.find(
      (step: { eventType: string; state: { stack: { functionName: string }[] } }) =>
        step.eventType === 'return' &&
        step.state.stack.some((frame) => frame.functionName === 'add'),
    )
    expect(returnStep.returnValue).toEqual({
      kind: 'primitive',
      type: 'int',
      value: 5,
    })
  })

  it('reports a syntax error without crashing', () => {
    const result = trace('def broken(:\n    pass\n')

    expect(result.error.type).toBe('SyntaxError')
  })
})
