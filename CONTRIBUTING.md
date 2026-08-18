# Contributing to AlgoLens

## Development process

AlgoLens is built in phases, each on its own branch, each producing a small
working improvement:

```
feat/phase-01-foundation
feat/phase-02-code-editor
feat/phase-03-python-execution
...
```

Rules for every phase:

1. Inspect the existing codebase before writing anything.
2. Implement only the current phase — don't get ahead of it.
3. Add tests for new behavior.
4. Run `npm run build`, `npm run lint`, and `npm test` before committing.
5. Keep commits small and use conventional prefixes (`feat:`, `fix:`,
   `test:`, `docs:`, `chore:`).
6. Keep each PR focused on a single phase.

## Commit style

```
feat: add Monaco code editor
fix: handle empty program execution
test: add execution trace tests
docs: update architecture documentation
```

Avoid vague commits like `update`, `changes`, or `fix stuff`.

## Local setup

```bash
npm install
npm run dev
```

## Before opening a PR

```bash
npm run lint
npm run build
npm test
```
