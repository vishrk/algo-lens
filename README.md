# AlgoLens

> See your algorithms execute, one step at a time.

AlgoLens is an interactive visual debugger for DSA and software engineering
interview prep. Paste a solution, run it, and step through the **real**
program execution — variables, arrays, pointers, call stack, recursion, and
more — rendered from an actual execution trace, not a scripted animation.

## Status

Phase 09: linked lists. Run Reverse Linked List, Merge Two Sorted Lists,
or Detect Cycle and watch real node chains render as `[1] → [2] → [3] →
null`, with pointer variables like `head`/`curr`/`prev` labeled at their
actual position — including a genuine cycle rendered as `↻ (cycle)`.
Trees, graphs, and other languages land in later phases. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the overall design and
[CONTRIBUTING.md](CONTRIBUTING.md) for the phased development process.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL in your browser.

## Scripts

| Script            | Purpose                          |
| ----------------- | --------------------------------- |
| `npm run dev`      | Start the Vite dev server         |
| `npm run build`    | Type-check and build for production |
| `npm run preview`  | Preview the production build      |
| `npm run lint`     | Run ESLint                        |
| `npm run format`   | Format the codebase with Prettier |
| `npm test`         | Run the Vitest test suite         |

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- ESLint + Prettier
- Vitest + Testing Library
