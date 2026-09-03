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
UI (currently TraceSummary; full step debugger lands in Phase 04)
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
