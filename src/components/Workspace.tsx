import { useState } from 'react'
import { CodeEditor } from './CodeEditor'
import { EditorToolbar } from './EditorToolbar'
import { TraceSummary } from './TraceSummary'
import { EXAMPLES } from '../lib/examples'
import type { Language } from '../lib/languages'
import { runCode } from '../engine/runEngine'
import type { ExecutionTrace } from '../engine/trace'

type RunStatus = 'idle' | 'running' | 'done' | 'failed'

export function Workspace() {
  const [exampleId, setExampleId] = useState(EXAMPLES[0].id)
  const [language, setLanguage] = useState<Language>('python')
  const example = EXAMPLES.find((e) => e.id === exampleId) ?? EXAMPLES[0]
  const [code, setCode] = useState(example.code[language])
  const [status, setStatus] = useState<RunStatus>('idle')
  const [trace, setTrace] = useState<ExecutionTrace | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  function selectExample(id: string) {
    const next = EXAMPLES.find((e) => e.id === id) ?? EXAMPLES[0]
    setExampleId(next.id)
    setCode(next.code[language])
  }

  function selectLanguage(next: Language) {
    setLanguage(next)
    setCode(example.code[next])
  }

  function reset() {
    setCode(example.code[language])
    setStatus('idle')
    setTrace(null)
    setRunError(null)
  }

  async function run() {
    setStatus('running')
    setRunError(null)
    try {
      const result = await runCode(language, code)
      setTrace(result)
      setStatus('done')
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err))
      setStatus('failed')
    }
  }

  return (
    <main className="flex min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col border-r border-border">
        <PaneHeader label="Code" />
        <EditorToolbar
          language={language}
          onLanguageChange={selectLanguage}
          exampleId={exampleId}
          onExampleChange={selectExample}
          onRun={run}
          onReset={reset}
        />
        <div className="min-h-0 flex-1">
          <CodeEditor language={language} value={code} onChange={setCode} />
        </div>
      </section>
      <section className="flex min-w-0 flex-1 flex-col">
        <PaneHeader label="Visualization" />
        <TraceSummary status={status} trace={trace} runError={runError} />
      </section>
    </main>
  )
}

function PaneHeader({ label }: { label: string }) {
  return (
    <div className="border-b border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wide text-text-dim">
      {label}
    </div>
  )
}
