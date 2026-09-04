# AlgoLens

> See your algorithms execute, one step at a time.

AlgoLens is an interactive visual debugger for DSA and software engineering
interview prep. Paste a solution, run it, and step through the **real**
program execution — variables, arrays, pointers, call stack, recursion, and
more — rendered from an actual execution trace, not a scripted animation.

## Status

Phase 04: step-by-step debugger. Run a Python example, then step through
its real execution trace with Reset/Previous/Step/Continue/Pause and a
speed control — the active line highlights in the editor as you go.
Variable/array/call-stack visualizations and other languages land in later
phases. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the overall
design and [CONTRIBUTING.md](CONTRIBUTING.md) for the phased development
process.

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
