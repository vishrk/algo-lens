import { loadPyodide, type PyodideInterface } from 'pyodide'
import tracerSource from './tracer.py?raw'
import type { ExecutionTrace } from '../trace'

interface RawTraceResult {
  steps: ExecutionTrace['steps']
  stdout: string
  error: ExecutionTrace['error'] | null
}

interface RunMessage {
  code: string
}

let pyodidePromise: Promise<PyodideInterface> | null = null

async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({ indexURL: '/pyodide/' }).then((pyodide) => {
      pyodide.runPython(tracerSource)
      return pyodide
    })
  }
  return pyodidePromise
}

self.onmessage = async (event: MessageEvent<RunMessage>) => {
  try {
    const pyodide = await getPyodide()
    pyodide.globals.set('__algolens_source__', event.data.code)
    const resultJson: string = pyodide.runPython(
      'import json\njson.dumps(trace_code(__algolens_source__, {"__name__": "__main__"}))',
    )
    const raw: RawTraceResult = JSON.parse(resultJson)

    const trace: ExecutionTrace = {
      language: 'python',
      steps: raw.steps,
      stdout: raw.stdout,
      error: raw.error ?? undefined,
      finalState: raw.steps.at(-1)?.state,
    }

    self.postMessage({ ok: true, trace })
  } catch (err) {
    self.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
