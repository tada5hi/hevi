# Testing

## Setup

- **Runner**: [Vitest](https://vitest.dev) 4
- **Test location**: `test/unit/**/*.{test,spec}.{js,ts}`
- **Config**: `test/vitest.config.ts`
- **Prerequisite**: none — no Helm installation is required; some specs do perform live HTTP `HEAD`
  requests (see *Network-dependent tests*).

Vitest globals are **not** enabled. Every spec explicitly imports what it uses:

```typescript
import { describe, expect, it } from 'vitest';
```

## Running Tests

```bash
npm run test                                              # run all tests
npm run test -- test/unit/version-bump.spec.ts            # run a single file
npm run test -- -t 'should bump version'                  # run tests by name
npm run test:coverage                                     # run with v8 coverage
```

## Test Layers

### Unit tests

Everything under `test/unit/` mirroring the `src/` layout:

| Spec                                            | Covers                                                        |
|-------------------------------------------------|---------------------------------------------------------------|
| `version-bump.spec.ts`                          | `bumpVersion()` including the no-level patch fallback         |
| `utils/error.spec.ts`                           | `extractErrorMessage()` across all thrown value shapes        |
| `bin/module.spec.ts`                            | `Binary.execute()` PATH resolution and non-zero exit handling |
| `bin/helm.spec.ts`, `bin/helm-chart-releaser.spec.ts` | Download URLs, executable names, cache paths            |
| `helm/chart/module.spec.ts`                     | `HelmChartContainer` version mutation, serialization, paths   |
| `helm/chart/dependency.spec.ts`                 | `file://` vs http(s) repository classification, quote cleanup |
| `helm/chart/helpers.spec.ts`                    | Option normalization incl. environment fallbacks              |
| `helm/chart/manager.spec.ts`                    | Version bump/set against the fixtures (dry run)               |
| `helm/chart/manager-save.spec.ts`               | Writing to disk in a temp directory, single/duplicate load    |
| `helm/chart/manager-commands.spec.ts`           | `helm`/`cr` argument construction via fakes                   |

## Test Helpers & Fixtures

- `test/data/charts/` — two fixture charts. `foo` depends on `bar` via `repository: file://../bar`,
  which is what exercises the dependency graph and version propagation.
- `test/utils/binary.ts` — `FakeBinary implements IBinary`, records every `execute()` call.

Specs that write to disk copy the fixtures into a fresh `fs.promises.mkdtemp()` directory and remove
it afterwards, so `test/data` is never mutated. Note that `manager-commands.spec.ts` also
`process.chdir()`s into that directory (the `.hevi` output paths are resolved relative to
`process.cwd()`) and restores the original cwd in `afterEach` — use
`fs.promises.realpath()` on the temp dir, otherwise the macOS `/var` → `/private/var` symlink makes
relative path assertions fail.

## Fakes Over Mocks

**Prefer fake implementations over spy-function stubs (`vi.fn()` / `vi.mock()`).** Every external
dependency sits behind an interface, so a fake with real in-memory behaviour is both simpler and
more faithful than a mock.

```typescript
// Good — a fake implements the port and records real calls
const helmBinary = new FakeBinary('helm');
const manager = new HelmChartManager({ helmBinary });
await manager.packageCharts();
expect(helmBinary.callsOf('package')).toHaveLength(2);

// Bad — spy stubs lack behaviour and couple the test to implementation details
const helmBinary = { execute: vi.fn(), download: vi.fn() };
```

When something is hard to test, prefer widening the seam (add an interface, add an optional
constructor option) over reaching for module mocking.

## Testing Philosophy

Tests should assert *expected* behaviour based on the documented contract — not merely confirm what
the implementation currently does. If a test fails, it may well have surfaced a real bug: the
`manager-commands.spec.ts` push assertions originally caught that `pushCharts()` built its package
path without the `.tgz` suffix that `helm package` actually produces.

## Network-dependent tests

`bin/helm.spec.ts` and `bin/helm-chart-releaser.spec.ts` each include two specs that issue a live
`HEAD` request against the real release URLs, to catch upstream URL-scheme changes. They require
outbound network access and will fail offline. The remaining assertions in those files are pure and
run offline.

## Code Coverage

```bash
npm run test:coverage
```

- Provider: `v8`
- Included: `src/**/*.{ts,tsx,js,jsx}`
- Excluded: `src/cli/**` (thin adapters), `src/utils/**` (I/O infrastructure)
- Thresholds: **80%** for branches, functions, lines and statements — the run fails below that.

## CI Pipeline

GitHub Actions (`.github/workflows/main.yml`) runs Install → Build → (Lint, Test) on Node 24.
CI runs `npm run test`, not `npm run test:coverage`, so coverage thresholds are enforced locally.

## Writing New Tests

1. Place the file in `test/unit/`, mirroring the `src/` path, with a `.spec.ts` extension.
2. Import `describe`/`it`/`expect` from `vitest` explicitly.
3. Depend on interfaces and inject `FakeBinary` (or another fake) rather than mocking modules.
4. Copy fixtures to a temp directory before writing to disk.
5. Run `npm run test` and `npx tsc --noEmit`.
