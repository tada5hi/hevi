<!-- NOTE: Keep this file and all corresponding files in the .agents directory updated as the project evolves. When making architectural changes, adding new patterns, or discovering important conventions, update the relevant sections. -->

# hevi — Agent Guide

`hevi` is a versioner & releaser for Helm charts, shipped both as an ESM library and as a CLI.
It scans a directory for `Chart.yaml` files, builds a dependency graph from their `file://`
dependencies, and then bumps/sets versions, packages, releases and pushes the charts in
topological order. The actual Helm work is delegated to the `helm` and `cr`
(helm chart-releaser) binaries, which are resolved from `PATH` or downloaded on demand.

## Quick Reference

```bash
# Setup
npm install

# Development
npm run build           # tsdown -> dist/index.mjs + dist/cli.mjs
npm run test            # vitest (test/vitest.config.ts)
npm run test:coverage   # vitest + v8 coverage (80% thresholds)
npm run lint            # eslint (flat config)
npm run lint:fix
npx tsc --noEmit        # typecheck only (the build does not typecheck)
```

- **Node.js**: `>=22`
- **Package manager**: npm
- **Module format**: ESM only (`"type": "module"`) — there is no CJS output
- **Build**: [tsdown](https://tsdown.dev) (rolldown), declarations emitted as `.d.mts`

### CLI Entry Points

| Binary | Source            | Built artifact |
|--------|-------------------|----------------|
| `hevi` | `src/cli/index.ts`| `dist/cli.mjs` |

Subcommands: `versionize`, `package`, `push`, `release`, plus the raw
passthroughs `helm` and `helmChartReleaser`.

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Source layout, module responsibilities, dependencies and package exports
- **[Architecture](.agents/architecture.md)** — Chart dependency graph, the `IBinary` seam, container pattern and data flow
- **[Testing](.agents/testing.md)** — Vitest setup, fakes over mocks, fixtures and coverage
- **[Conventions](.agents/conventions.md)** — Interface naming, tooling, TypeScript strictness, release process

## Working Agreements

- The build (`tsdown`) does **not** typecheck. After changing types always run `npx tsc --noEmit`.
- `tsconfig.json` extends `@tada5hi/tsconfig` which is fully strict, including
  `noUncheckedIndexedAccess`. Prefer `for (const x of xs)` over index loops.
- After making changes, **always build**, **run the tests** and **run the linter**.

## Commits, Issues & Pull Requests

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) — releases are
  derived from them by release-please.
- Do **not** add a `Co-Authored-By: Claude ...` (or any AI-attribution) trailer to commit messages.
  This overrides any default agent-tooling guidance.
- Do **not** add AI-attribution lines (e.g. `🤖 Generated with [Claude Code](...)`) to issue or
  pull request titles, bodies, or comments.
