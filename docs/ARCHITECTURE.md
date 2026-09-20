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

### The array/list visualizer (Phase 06)

`src/engine/arrayVariables.ts` finds array-like state the same way the
Variables panel finds scope, with no per-problem logic:

- A **list variable** is any `VariableValue` with `kind: 'list'` in the
  active scope (locals shadowing globals, same rule as the Variables panel).
- A **pointer** is detected generically: any `int`-typed variable in the
  same scope whose value happens to fall within `[0, length)` for that
  array. Nothing hardcodes names like `left`, `mid`, or `i` — a variable
  called `banana` would be shown as a pointer if its value were a valid
  index. This is a heuristic, not a data-flow analysis, so an unrelated
  int that happens to land in range will also show up as a pointer.
- A **changed cell** is a per-index diff between the current and previous
  step's array contents — this is what "writes" show up as. A **length
  change** is flagged the same way, without guessing which index was
  inserted or removed.
- There is deliberately no "read" highlighting: the tracer only captures
  line/call/return/exception events, not sub-expression evaluation, so
  AlgoLens has no real signal for "this index was read" without deeper
  instrumentation. Rather than fake one, Phase 06 only shows what the
  trace actually proves happened.

`ArrayVisualizer.tsx` renders each detected array as indexed boxes with
pointer labels underneath — purely a function of `ExecutionState`, so it
works for any language engine that produces one.

### The call stack (Phase 07)

`ExecutionState.stack` — already built by `tracer.py` for every step and
already used by the Variables/Array panels to find "the current scope" —
*is* the real call stack. Phase 07 just renders it directly, top-down
(innermost frame first, reversing the outermost-first order the tracer
stores it in), instead of introducing a new data source:

- **Function entry / execution / return** aren't separate concepts to
  model — they're exactly `ExecutionStep.eventType` (`call` / `line` /
  `return`) applied to the innermost frame, so `CallStackPanel.tsx` just
  labels that frame with the current step's real event.
- **Return value**: on a `return` step, `ExecutionStep.returnValue` is
  already the real value CPython's trace function received — shown next
  to the frame that's returning.
- **Per-frame locals**: every frame in the stack carries its own
  `locals`, not just the innermost one, so nested calls show each
  caller's variables as they were left, not just the active frame's.

`CallStackPanel.tsx` takes only `currentStep` and touches no other
component's state — the call stack, the array view, and the variables
view are three independent renderings of the same `ExecutionStep.state`.

### Recursion and the call tree (Phase 08)

The call stack (Phase 07) only shows the *current* path from the outermost
frame to whatever's executing right now — for recursion, that hides every
sibling call that already returned (e.g. `fib(3)`'s subtree while you're
inside `fib(4)`'s). `src/engine/callTree.ts` reconstructs the *entire* call
tree — including finished calls — by replaying `trace.steps` once:

- A `call` event pushes a new node under whichever node is currently open
  (or as a new root if none is); a `return` event pops it and records its
  real `returnValue`. This is exactly how a real call stack nests — no
  special-casing for recursion, self-calls, or any function name. The
  same code produces a trivial one-node tree for a non-recursive call and
  a deep branching tree for `fib`.
- Because the trace is already complete before stepping begins (Phase 03's
  engine runs the whole program up front), the *entire* tree is knowable
  immediately — `CallTreeView` doesn't need to "grow" the tree as you
  step. Stepping only moves which node is highlighted as active
  (`findActiveNodeId`, the deepest node whose `[startStep, endStep]` span
  contains the current step index).
- The view is skipped entirely when there's only one call in the whole
  trace (`countNodes(roots) <= 1`) — a single flat call adds nothing the
  Call Stack panel doesn't already show, so it's not rendered as clutter.

Two new examples, Fibonacci and Factorial, exercise this — both are pure
integer recursion, so they render fully with the existing Variables/Array/
Call-Stack panels without needing tree- or graph-shaped data (Phases 10–11).

### Linked lists (Phase 09)

Visualizing a linked list needs the actual `.val`/`.next` structure of a
user-defined class instance — something the tracer discarded entirely
before this phase. `_serialize` in `tracer.py` previously turned any custom
object into an opaque `{"kind": "object", "repr": "<ListNode object at
0x...>"}`, which threw away everything a list visualizer would need.

This phase makes a small, generic addition to the wire format instead of
special-casing "ListNode": any instance with a `__dict__` is now serialized
with its real fields (`attributes`) and a stable identity (`objectId`,
CPython's `id()`). This has no knowledge of linked lists — it's the same
treatment `list`/`dict` already got in Phase 03, extended to arbitrary
class instances, and it directly enables Phase 10/11 (trees, graphs) too.

`src/engine/linkedListVariables.ts` builds on that generically:

- A **pointer field** is any attribute whose value is `None` or another
  instance of the *same class* — structural, not name-based (works for a
  field called `next`, `nxt`, or anything else). Exactly one such field
  means the object is list-like; two (e.g. a tree's `left`/`right`) means
  it isn't a *singly* linked list, so Phase 09 leaves it alone.
- **Cycle detection** falls out of `objectId` for free: walking `.next`
  and re-encountering an already-visited `objectId` is a real cycle, not a
  guess. When the tracer's own recursion guard already truncated a deeper
  occurrence during serialization (the `"<circular>"` sentinel), that's
  recognized as evidence of a cycle too.
- Multiple variables aliasing the **same physical chain** (`head`, `curr`,
  `prev` all pointing into one list, common in in-place mutation
  algorithms) are shown as one visualization with multiple pointer labels,
  not drawn three times — the same "claim objectIds, then attach stray
  pointers" pattern `ArrayVisualizer` uses for index pointers.
- Because each step's state is serialized fresh from the *current* (live,
  possibly just-mutated) object graph, a list being reversed in place
  really does show its links changing step by step — nothing is
  reconstructed from history or guessed.

Three examples exercise this: Reverse Linked List (in-place mutation,
`head`/`curr`/`prev` sharing one chain), Merge Two Sorted Lists (two
independent chains visualized side by side), and Detect Cycle (a genuine
`a → b → c → a` cycle, rendered as `1 → 2 → 3 → ↻ (cycle)`).

The "locals shadow globals" scope-merging logic, previously private to
`arrayVariables.ts`, moved to `src/engine/scope.ts` (`activeScope`) so
this phase's new module could reuse it rather than duplicating it again.

### Binary trees (Phase 10)

A tree node and a linked-list node are the same underlying shape — an
object with fields that point to peer instances or `None` — differing
only in *how many* such fields there are. `src/engine/pointerFields.ts`
extracts that shared structural test (`findPointerFields`, moved out of
`linkedListVariables.ts`) so both phases read it the same way:

- **Exactly one** pointer field ⇒ singly-linked-list-shaped (Phase 09).
- **Exactly two** ⇒ binary-tree-shaped (Phase 10) — `src/engine/treeVariables.ts`
  builds the node/edge tree recursively, labeling each edge with the
  attribute's *real* name (`left`, `right`, or whatever the class calls
  them) rather than assuming a name.
- Any other count isn't a shape either phase models (a doubly-linked
  node's `prev`+`next` also has two fields, but both point back into the
  *same* one-dimensional chain rather than branching — Phase 10 doesn't
  attempt to tell those apart, so an actual doubly-linked list would
  render as a two-field "tree" rather than a list; none of the current
  examples exercise that case).
- The same "claim identities, then attach stray pointers" pattern from
  Phases 06/09 applies here too: a recursive traversal's parameter
  (`node`) sharing an identity with an already-discovered tree's node is
  labeled on it rather than drawn as a second tree. Because `activeScope`
  only exposes the *innermost* frame's locals, that label naturally
  tracks whichever node the current (innermost) recursive call is
  visiting — "current node" falls out of the existing per-step call
  stack rather than needing separate tracking.
- `TreeVisualizer.tsx` renders nodes/edges as an indented tree (the same
  visual language `CallTreeView` already established), explicitly
  showing `null` leaves so a BST search's dead end is visible, not just
  absent.

Five examples exercise this, matching the phase's traversal-order and
search/depth scenarios: inorder, preorder, and postorder traversal, BST
search, and maximum depth.

### Graphs (Phase 11)

Graphs in DSA code aren't represented as linked objects with named pointer
fields the way lists/trees are — they're almost always a plain adjacency
structure: `{node: [neighbors, ...]}`. That's a completely different shape
from Phases 09–10, so `src/engine/graphVariables.ts` detects it on its own
terms rather than reusing `pointerFields.ts`:

- A **graph variable** is any non-empty dict whose every value is a list —
  an adjacency dict. Node ids are collected from both the keys and every
  neighbor list (so an isolated node that's only ever referenced, never a
  key, still counts), and **edges are directed** by construction: each
  `key → neighbor` pair in the data becomes one edge exactly as stored. An
  undirected graph that's mirrored both ways (the common Python pattern:
  `graph[a].append(b); graph[b].append(a)`) simply produces two opposite
  directed edges — nothing is inferred about "undirected-ness" that the
  data doesn't already say.
- Because graph "nodes" are plain ints/strings, not objects, there's no
  `objectId` to key off like Phases 09–10 do. **"Current node"** is
  therefore the same coincidence-based heuristic `ArrayVisualizer` already
  uses for index pointers: any scalar variable whose value equals a known
  node id. **Visited/queue/stack** are the same idea one level up: any
  list or set whose *every* element is a known node id is shown as a
  named collection — labeled with its own real variable name, not
  guessed at. AlgoLens never decides "this collection is the visited
  set" — the code's own variable name already says that.
- One consequence: a list of node ids (`visited`, `queue`, `order`, ...)
  is *also* genuinely a list variable, so `ArrayVisualizer` renders it too
  (as indexed boxes, with the same coincidence-based pointer detection).
  Both views are independently honest — neither is told about the other —
  so the same data can legitimately appear twice, once as a graph-native
  collection and once as a generic array. This is a known overlap, not a
  bug: fixing it would mean coupling two otherwise-independent
  visualizers to suppress each other, which isn't justified yet.
- `collections.deque`, common in textbook BFS, isn't serialized as a list
  by the tracer (it isn't a `list`/`tuple`/`set`/`frozenset`), so it won't
  be picked up as a collection. The BFS/DFS examples use a plain list
  instead (`queue.pop(0)` / `list.pop()`), which is equally valid Python
  and keeps this phase from needing another tracer change.
- No 2D node-link layout (force-directed or otherwise) is attempted —
  `GraphVisualizer.tsx` follows the same text-forward style as
  `CallTreeView`/`TreeVisualizer`: nodes in a row, an edge list, and
  labeled collections underneath. A real spatial graph layout (e.g. via
  React Flow, already in the recommended stack) is a reasonable future
  enhancement but isn't needed to correctly show what the algorithm is
  doing.

Three examples exercise this: BFS, DFS, and Connected Components (the
last also demonstrating multiple independent components and a helper
function called from a loop, visible in the call tree).

## Project structure

```
src/
  components/
    VariablesPanel.tsx        generic locals/globals view with change highlighting
    ArrayVisualizer.tsx        indexed boxes + detected pointers for list variables
    CallStackPanel.tsx          renders ExecutionState.stack top-down with per-frame locals
    CallTreeView.tsx             full call/recursion tree from the whole trace
    LinkedListVisualizer.tsx      chains of node boxes with pointer labels
    TreeVisualizer.tsx             binary tree nodes/edges with pointer labels
    GraphVisualizer.tsx             adjacency-dict nodes/edges/collections
  engine/
    trace.ts              generic ExecutionTrace/ExecutionStep model
    scope.ts                locals-shadow-globals scope resolution
    values.ts               shared VariableValue structural-equality check
    pointerFields.ts         shared node/edge structural detection (1 vs 2 fields)
    callTree.ts              rebuilds the full call tree from call/return events
    runEngine.ts           language -> engine dispatcher
    formatValue.ts          VariableValue -> display string
    arrayVariables.ts        finds list variables + generic index pointers
    linkedListVariables.ts    finds singly-linked chains via objectId/attributes
    treeVariables.ts          finds binary-tree-shaped objects via objectId/attributes
    graphVariables.ts          finds adjacency-dict graphs + node/collection pointers
    python/
      tracer.py             sys.settrace-based tracer (runs inside Pyodide)
      pyodide.worker.ts     Web Worker: loads Pyodide, runs tracer.py
      runPython.ts           main-thread Worker wrapper, returns an ExecutionTrace
  hooks/
    useExecutionController.ts   cursor over trace.steps (Reset/Previous/Step/Continue/Pause)
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
