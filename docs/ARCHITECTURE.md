# Architecture

## Core principle

AlgoLens visualizes **real program execution**, not a scripted animation of
source code. Every visualization is derived from a structured execution
trace produced by actually running the user's code.

## Conceptual pipeline

```
Code Editor
    v
Execution Engine   (language-specific: Python, JS, TS)
    v
Execution Trace     (generic, language-agnostic contract)
    v
Variables / Call Stack / Data State
    v
Visualizations
    v
Explanations
```

- The **execution engine** knows nothing about React.
- The **visualizers** know nothing about which language produced the trace.
- The **execution trace** is the contract between the two halves.

## Current state (Phase 03)

The app shell (Phase 01) and Monaco editor with language/example selection
(Phase 02) are in place. Phase 03 adds the first real execution engine:
Python, via Pyodide (CPython compiled to WebAssembly) running in a Web
Worker.

### How Python execution works

Python execution uses CPython's own `sys.settrace` — the same mechanism
`pdb` is built on — so every step in the trace corresponds to a real
bytecode-level trace event, not a re-interpretation of the source:

```
User code (string)
    v
Web Worker (src/engine/python/pyodide.worker.ts)
    v
Pyodide (CPython/WASM, loaded once, reused across runs)
    v
tracer.py: sys.settrace over exec(code) — real call/line/return/exception events
    v
Each event's frame is serialized (locals, globals, call stack) to plain JSON
    v
ExecutionTrace (src/engine/trace.ts) — language-agnostic
    v
runCode() (src/engine/runEngine.ts) — language dispatcher
    v
UI: an ExecutionController cursor over trace.steps, driving the debugger
```

Because the engine runs in a Web Worker, a slow or looping user program
never blocks the UI thread. Pyodide's ~13MB runtime assets are copied from
`node_modules/pyodide` into `public/pyodide/` by a `postinstall` script
(`scripts/copy-pyodide-assets.mjs`) rather than committed to the repo or
pulled from a version-pinned CDN.

`tracer.py`'s serializer only knows about JSON-safe shapes
(`primitive` / `list` / `dict` / `object`-with-repr) — it has no knowledge of
Two Sum, linked lists, or any specific problem. Later phases (05+) build
visualizations on top of this same generic `VariableValue` shape.

A step cap (`MAX_STEPS` in tracer.py) prevents a runaway loop from producing
an unbounded trace. Full timeout/error UX is Phase 16's job — this is just
the minimum needed so a bug in user code can't wedge the worker forever.

### The step-by-step debugger (Phase 04)

`ExecutionTrace.steps` is an immutable array — every step already exists
once a run finishes. Stepping through it is therefore just moving a cursor,
never re-running anything:

```
ExecutionTrace.steps[]  (immutable, produced once by the engine)
    v
useExecutionController(trace)   src/hooks/useExecutionController.ts
    - stepIndex: number (cursor into steps[])
    - Reset / Previous / Step / Continue / Pause / speed
    v
DebuggerControls   renders the cursor's controls + "Step N / M"
CodeEditor          highlights steps[stepIndex].lineNumber via a Monaco decoration
TraceSummary        shows the current step's line/event/call-path
```

`useExecutionController` owns no knowledge of Python, or of what a
"variable" or "array" is — it only knows how to move an index around an
array of steps. This keeps it reusable once Phase 05+ visualizers need the
same current-step cursor.

### The Variables panel (Phase 05)

`src/components/VariablesPanel.tsx` renders `currentStep.state` generically —
it has no special-casing for Two Sum, binary search, or any other problem:

- **Scope**: the innermost stack frame's `locals` are shown as "Locals —
  `<functionName>`"; `state.globals` are always shown as "Globals". At
  module scope CPython's frame locals *are* its globals (the same dict),
  so the Locals section is skipped there to avoid showing the same
  variables twice under two labels.
- **Changed-variable highlighting**: each row is compared against the same
  name in the equivalent scope of `previousStep` (`stepIndex - 1`) via a
  structural equality check on the already-JSON-safe `VariableValue`. A
  variable that's new (didn't exist a step ago) or whose value differs is
  highlighted, with its previous value shown underneath.
- **Type**: each `VariableValue` already carries its Python type name
  (`int`, `list`, `dict`, ...) from `tracer.py`'s serializer, so the panel
  just displays it — no inference needed on the JS side.

Because this reads from `ExecutionStep.state`, the same shape produced by
any future language engine, it never needs to know Python exists.

## Project structure

```
src/
  components/   UI components
  engine/
    trace.ts              generic ExecutionTrace/ExecutionStep model
    runEngine.ts           language -> engine dispatcher
    formatValue.ts          VariableValue -> display string
    python/
      tracer.py             sys.settrace-based tracer (runs inside Pyodide)
      pyodide.worker.ts     Web Worker: loads Pyodide, runs tracer.py
      runPython.ts           main-thread Worker wrapper, returns an ExecutionTrace
  hooks/
    useExecutionController.ts   cursor over trace.steps (Reset/Previous/Step/Continue/Pause)
  components/
    VariablesPanel.tsx           generic locals/globals view with change highlighting
  lib/            language + DSA example data
  test/           test setup
  App.tsx         app shell
  main.tsx        React entry point
  index.css       Tailwind entry + theme tokens
scripts/
  copy-pyodide-assets.mjs   postinstall: node_modules/pyodide -> public/pyodide
docs/
  ARCHITECTURE.md
```
