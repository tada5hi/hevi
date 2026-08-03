# Conventions

## Tooling

| Tool                        | Purpose                                                            |
|-----------------------------|--------------------------------------------------------------------|
| `tsdown` (rolldown)         | Bundling to ESM + `.d.mts` declarations                            |
| `typescript`                | Typechecking only (`noEmit`) — run via `npx tsc --noEmit`          |
| `vitest` + `@vitest/coverage-v8` | Test runner and coverage                                      |
| `eslint` 10 + `@tada5hi/eslint-config` | Flat-config linting (`eslint.config.js`)                |
| `husky`                     | Git hooks (`prepare: husky`)                                       |
| `@tada5hi/commitlint-config`| Conventional Commits ruleset (`commitlint.config.mjs`)             |
| `release-please`            | Version bump, changelog and tag from conventional commits          |
| `tada5hi/monoship`          | npm publishing from CI                                             |

## Workflow

- The build does **not** typecheck. After changing types, run `npx tsc --noEmit`.
- After making changes, **always build**, **run the tests** and **run the linter** on the result.
- Prefer `npm run lint:fix` — the shared config is stylistic and auto-fixes most findings. It can
  leave trailing whitespace behind when it inserts line breaks; strip it before committing.

## Code Style

- **Module format**: ESM only. `"type": "module"`, no CJS output, no `require`.
- **Indentation**: 4 spaces (`.editorconfig`)
- **Line endings**: LF, final newline required, no trailing whitespace
- **Linting**: `@tada5hi/eslint-config` flat config, `dist/**` ignored
- Every source file starts with the project copyright header.
- Imports are ordered: external packages, then `node:` builtins, then relative modules.
- `console` is only used in the raw `helm` / `helmChartReleaser` passthrough commands (which stream
  the binary's stdout verbatim); everything else logs through `consola`.

## Naming Conventions

### Interfaces

Interfaces are prefixed with `I`; the implementing class carries the bare name.

```typescript
export interface IBinary { /* ... */ }
export abstract class Binary implements IBinary { /* ... */ }

export interface IHelmChartContainer { /* ... */ }
export class HelmChartContainer implements IHelmChartContainer { /* ... */ }
```

**Abstracting classes behind interfaces and referencing the interface is the preferred strategy** —
it is what allows fake implementations to be plugged in. When adding a class that will be consumed
by another module, add the matching `I`-prefixed interface and type the consumer against it.

Interfaces expose getters as `readonly` properties:

```typescript
export interface IBinary {
    readonly directory : string;   // implemented as `get directory()`
}
```

### Type suffixes

| Suffix               | When to use                                       | Example                              |
|----------------------|---------------------------------------------------|--------------------------------------|
| `*Options`           | Caller-supplied input, all fields optional        | `HelmBinOptions`, `BinaryOptions`    |
| `*OptionsNormalized` | Fully resolved result of a `normalize*` function  | `HelmChartsVersionOptionsNormalized` |
| `I*`                 | Interfaces / ports                                | `IBinary`, `IHelmChartManager`       |

### Functions & files

- Functions use verb prefixes: `create*`, `define*`, `normalize*`, `build*`, `extract*`, `bump*`.
- CLI command factories are named `defineCLI<Name>Command()`.
- File names are kebab-case and match their primary export's concern.

## File Organization

- Exported **types and interfaces** live in a `types.ts` file in the same directory.
- Implementation lives in `module.ts`; a directory with several implementations gets one file each.
- Barrel `index.ts` files re-export from `types.ts` and the implementation modules.
- Shared constants live in a `constants.ts` next to their consumers.
- `src/utils/` is internal and deliberately **not** re-exported from `src/index.ts`.

## TypeScript

Extends `@tada5hi/tsconfig`, which is fully strict. Notable settings inherited or overridden:

- `strict: true`, plus `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`,
  `noImplicitReturns`, `noImplicitOverride`, `verbatimModuleSyntax`
- Overridden locally: `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`,
  `noEmit: true`, `allowImportingTsExtensions: true`
- Only `src/**/*` is included; test files are typechecked through the editor/vitest, not `tsc`.

Consequences worth knowing:

- `noUncheckedIndexedAccess` makes `array[i]` and `record[key]` yield `T | undefined`.
  Prefer `for (const item of items)` over index loops, and guard record lookups.
- `verbatimModuleSyntax` requires `import type` for type-only imports.
- Use optional catch binding (`catch {}`) when the error value is unused.

## ESM Specifics

- There is no `__dirname`. `src/constants.ts` derives `ROOT_DIR` from
  `path.dirname(fileURLToPath(import.meta.url))`; this resolves correctly both from `src/` during
  tests and from `dist/` after bundling.
- `dist/cli.mjs` keeps its `#!/usr/bin/env node` shebang and is made executable by tsdown.

## Build Output

`npm run build` runs `tsdown` and produces, in `dist/`:

- `index.mjs` + `index.d.mts` — the library entry
- `cli.mjs` (executable, shebang preserved) — the `hevi` binary
- a shared chunk holding code common to both entries, plus source maps

Runtime dependencies are externalized automatically from `package.json`.

## Commit Convention

Commits follow **Conventional Commits**:

```
<type>(<scope>): <description>

feat: add oci push support
fix: append .tgz suffix to pushed chart path
build(deps-dev): bump vitest
```

`release-please` derives the next version and the changelog from these, so the type matters.

## Release Process

1. Commits land on `master`.
2. `.github/workflows/release.yml` runs `googleapis/release-please-action`, which maintains a
   release PR (version bump in `package.json` + `.release-please-manifest.json`, `CHANGELOG.md`).
3. Merging that PR creates the tag and GitHub release, then the same workflow installs, builds and
   publishes to npm via `tada5hi/monoship@v2`.

Version state lives in `.release-please-manifest.json`; config in `release-please-config.json`.

## CI/CD

- `.github/workflows/main.yml` — CI on push/PR to `master`, `develop`, `next`, `beta`, `alpha`:
  Install → Build → (Lint, Test) on Node 24, with concurrency cancellation.
- `.github/workflows/release.yml` — release-please + monoship, on push to `master`.
- `.github/actions/{install,build}` — composite actions with npm and build caching.
- `.github/dependabot.yml` — daily npm and GitHub Actions updates targeting `master`, grouped into
  `majorProd`, `majorDev` and `minorAndPatch`.

## External Binaries

`hevi` pins default versions of the tools it drives. When bumping them, verify the download URL
scheme and archive layout still hold, and that the subcommands/flags used in
`src/helm/chart/manager.ts` still exist:

| Binary                  | Default | Source                                            |
|-------------------------|---------|---------------------------------------------------|
| `helm`                  | `4.2.3` | `https://get.helm.sh/...`                         |
| `cr` (chart-releaser)   | `1.8.1` | `https://github.com/helm/chart-releaser/releases` |

## Best Practices

- Use **ESM** and modern TypeScript/JavaScript.
- Before adding new code, study surrounding patterns, naming conventions and architectural decisions.
- Put defaults and environment fallbacks in `normalize*` functions, not in consumers.
- Never throw or catch bare values — normalize unknown thrown values with `extractErrorMessage()`.
- Maintain consistency with existing conventions.
