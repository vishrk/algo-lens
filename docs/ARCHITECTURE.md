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

## Current state (Phase 01)

Only the application shell exists: a header and a two-pane workspace layout
(code pane / visualization pane), both placeholders. No editor, no execution
engine, no trace model yet — those are introduced in later phases as
described in the repository root prompt / CONTRIBUTING.md phase list.

## Project structure

```
src/
  components/   UI components
  test/         test setup
  App.tsx       app shell
  main.tsx      React entry point
  index.css     Tailwind entry + theme tokens
docs/
  ARCHITECTURE.md
```
