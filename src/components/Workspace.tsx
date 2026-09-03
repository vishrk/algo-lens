import { useState } from 'react'
import { CodeEditor } from './CodeEditor'
import { EditorToolbar } from './EditorToolbar'
import { EXAMPLES } from '../lib/examples'
import type { Language } from '../lib/languages'

export function Workspace() {
  const [exampleId, setExampleId] = useState(EXAMPLES[0].id)
  const [language, setLanguage] = useState<Language>('python')
  const example = EXAMPLES.find((e) => e.id === exampleId) ?? EXAMPLES[0]
  const [code, setCode] = useState(example.code[language])
  const [ranAt, setRanAt] = useState<number | null>(null)

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
          onRun={() => setRanAt(Date.now())}
          onReset={reset}
        />
        <div className="min-h-0 flex-1">
          <CodeEditor language={language} value={code} onChange={setCode} />
        </div>
      </section>
      <section className="flex min-w-0 flex-1 flex-col">
        <PaneHeader label="Visualization" />
        <div className="flex flex-1 items-center justify-center text-sm text-text-dim">
          {ranAt === null
            ? 'Press Run to execute your code'
            : 'Execution tracing lands in Phase 03'}
        </div>
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
