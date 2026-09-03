import type { ExecutionTrace } from '../trace'

let worker: Worker | null = null

function getWorker(): Worker {
  worker ??= new Worker(new URL('./pyodide.worker.ts', import.meta.url), {
    type: 'module',
  })
  return worker
}

export function runPython(code: string): Promise<ExecutionTrace> {
  const activeWorker = getWorker()

  return new Promise((resolve, reject) => {
    function handleMessage(event: MessageEvent) {
      activeWorker.removeEventListener('message', handleMessage)
      const data = event.data
      if (data.ok) {
        resolve(data.trace as ExecutionTrace)
      } else {
        reject(new Error(data.error))
      }
    }
    activeWorker.addEventListener('message', handleMessage)
    activeWorker.postMessage({ code })
  })
}
