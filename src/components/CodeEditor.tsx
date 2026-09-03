import Editor from '@monaco-editor/react'
import type { Language } from '../lib/languages'

interface CodeEditorProps {
  language: Language
  value: string
  onChange: (value: string) => void
}

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  return (
    <Editor
      language={language}
      value={value}
      onChange={(next) => onChange(next ?? '')}
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
