import { LANGUAGES, LANGUAGE_LABELS, type Language } from '../lib/languages'
import { EXAMPLES } from '../lib/examples'

interface EditorToolbarProps {
  language: Language
  onLanguageChange: (language: Language) => void
  exampleId: string
  onExampleChange: (exampleId: string) => void
  onRun: () => void
  onReset: () => void
}

export function EditorToolbar({
  language,
  onLanguageChange,
  exampleId,
  onExampleChange,
  onRun,
  onReset,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
      <select
        value={exampleId}
        onChange={(e) => onExampleChange(e.target.value)}
        className="rounded border border-border bg-bg px-2 py-1 text-sm text-text"
      >
        {EXAMPLES.map((example) => (
          <option key={example.id} value={example.id}>
            {example.title}
          </option>
        ))}
      </select>

      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="rounded border border-border bg-bg px-2 py-1 text-sm text-text"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_LABELS[lang]}
          </option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded border border-border px-3 py-1 text-sm text-text-dim hover:text-text"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onRun}
          className="rounded bg-accent px-3 py-1 text-sm font-medium text-bg hover:opacity-90"
        >
          Run
        </button>
      </div>
    </div>
  )
}
