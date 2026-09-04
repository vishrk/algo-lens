import Editor, { type OnMount } from '@monaco-editor/react'
import { useEffect, useRef } from 'react'
import type { Language } from '../lib/languages'

type MonacoEditor = Parameters<OnMount>[0]
type DecorationsCollection = ReturnType<MonacoEditor['createDecorationsCollection']>

interface CodeEditorProps {
  language: Language
  value: string
  onChange: (value: string) => void
  highlightLine?: number | null
}

export function CodeEditor({
  language,
  value,
  onChange,
  highlightLine = null,
}: CodeEditorProps) {
  const editorRef = useRef<MonacoEditor | null>(null)
  const decorationsRef = useRef<DecorationsCollection | null>(null)

  const handleMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance
    decorationsRef.current = editorInstance.createDecorationsCollection([])
  }

  useEffect(() => {
    const decorations = decorationsRef.current
    if (!decorations) return

    if (highlightLine == null) {
      decorations.set([])
      return
    }

    decorations.set([
      {
        range: {
          startLineNumber: highlightLine,
          startColumn: 1,
          endLineNumber: highlightLine,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: 'current-line-highlight',
          linesDecorationsClassName: 'current-line-marker',
        },
      },
    ])
    editorRef.current?.revealLineInCenterIfOutsideViewport(highlightLine)
  }, [highlightLine])

  return (
    <Editor
      language={language}
      value={value}
      onChange={(next) => onChange(next ?? '')}
      onMount={handleMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
    />
  )
}
