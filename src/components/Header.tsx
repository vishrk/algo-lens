export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-lg font-semibold text-text">AlgoLens</span>
        <span className="text-sm text-text-dim">
          See your algorithms execute, one step at a time.
        </span>
      </div>
    </header>
  )
}
