export function Workspace() {
  return (
    <main className="flex min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col border-r border-border">
        <PaneHeader label="Code" />
        <div className="flex flex-1 items-center justify-center text-sm text-text-dim">
          Editor coming in Phase 02
        </div>
      </section>
      <section className="flex min-w-0 flex-1 flex-col">
        <PaneHeader label="Visualization" />
        <div className="flex flex-1 items-center justify-center text-sm text-text-dim">
          Execution trace visualizer coming soon
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
