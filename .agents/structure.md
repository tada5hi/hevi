# Project Structure

`hevi` is a **single package** (no workspaces). Source lives in `src/`, tests in `test/`.

## Directory Layout

```
hevi/
├── src/
│   ├── index.ts                       # public library entry (barrel)
│   ├── types.ts                       # LogFn
│   ├── constants.ts                   # ROOT_DIR (import.meta.url based), LogLevel
│   ├── version-bump.ts                # bumpVersion() — semver helper
│   ├── bin/                           # external binaries (helm, cr)
│   │   ├── module.ts                  # abstract Binary implements IBinary
│   │   ├── types.ts                   # BinaryOptions, IBinary
│   │   ├── helm/                      # HelmBinary + HelmBinOptions
│   │   └── helm-chart-releaser/       # HelmChartReleaserBinary + options
│   ├── helm/
│   │   └── chart/
│   │       ├── manager.ts             # HelmChartManager — orchestrator
│   │       ├── module.ts              # HelmChartContainer — one Chart.yaml
│   │       ├── dependency/module.ts   # HelmChartDependencyContainer
│   │       ├── types.ts               # HelmChart, I* interfaces, option types
│   │       ├── constants.ts           # .hevi output directories
│   │       └── helpers/
│   │           ├── version/           # normalizeHelmChartsVersionOptions
│   │           └── push/              # normalizeHelmChartsReleaseOptions
│   ├── cli/
│   │   ├── index.ts                   # #!/usr/bin/env node — citty runMain
│   │   ├── module.ts                  # createCLIEntryPointCommand()
│   │   └── commands/                  # one file per subcommand
│   └── utils/                         # internal helpers (not re-exported by src/index.ts)
│       ├── error.ts                   # extractErrorMessage()
│       ├── exec.ts                    # executeShellCommand() (tinyexec)
│       ├── download.ts                # download() + unpack dispatch
│       ├── unpack-tar.ts
│       ├── unpack-zip.ts
│       └── stream-to-buffer.ts
├── test/
│   ├── vitest.config.ts
│   ├── data/charts/{foo,bar}/         # fixture charts (foo depends on bar via file://)
│   ├── utils/binary.ts                # FakeBinary implements IBinary
│   └── unit/                          # *.spec.ts
├── tsdown.config.ts
├── eslint.config.js
├── release-please-config.json
└── .release-please-manifest.json
```

## Module Responsibilities

| Module                                   | Purpose                                                                             |
|------------------------------------------|-------------------------------------------------------------------------------------|
| `src/helm/chart/manager.ts`              | Loads charts, builds the dependency graph, runs versionize/package/release/push       |
| `src/helm/chart/module.ts`               | Wraps a single `Chart.yaml`: version mutation, serialization, path derivation          |
| `src/helm/chart/dependency/module.ts`    | Wraps one `dependencies[]` entry; classifies the repository as `file://` or http(s)   |
| `src/helm/chart/helpers/*`               | Normalizes user input into fully-resolved option objects                              |
| `src/bin/module.ts`                      | `Binary` base: resolve via `PATH`, else download, chmod and execute                   |
| `src/bin/helm/*`                         | Helm download URL/layout (default `4.2.3`)                                            |
| `src/bin/helm-chart-releaser/*`          | chart-releaser (`cr`) download URL/layout (default `1.8.1`)                           |
| `src/cli/*`                              | citty command definitions; thin adapters over `HelmChartManager`                       |
| `src/utils/*`                            | Process execution, HTTP download, archive extraction, error message extraction         |

## Key Dependencies

| Dependency             | Role                                                             |
|------------------------|------------------------------------------------------------------|
| `citty`                | CLI command definition & arg parsing                             |
| `consola`              | CLI logging                                                      |
| `locter`               | Locating (`locateMany`) and reading (`read`) `Chart.{yml,yaml}`  |
| `yaml`                 | Serializing chart definitions back to disk                       |
| `graph-data-structure` | `Graph` + `topologicalSort` for chart dependency ordering        |
| `semver`               | Version inspection and increments                                |
| `tinyexec`             | Spawning `helm` / `cr`                                           |
| `hapic`                | HTTP client used to download binaries                            |
| `tar`, `yauzl`         | Extracting `.tar.gz` / `.zip` binary archives                    |
| `dotenv`               | Loading `.env` in the CLI entry point                            |
| `@actions/github`      | Inferring owner/repo from the GitHub Actions context             |

## Package Exports

ESM only — there is no `require` condition and no `.cjs` output.

```json
{
    "main": "dist/index.mjs",
    "types": "dist/index.d.mts",
    "exports": {
        "./package.json": "./package.json",
        ".": {
            "types": "./dist/index.d.mts",
            "import": "./dist/index.mjs"
        }
    },
    "bin": { "hevi": "dist/cli.mjs" }
}
```

`src/index.ts` re-exports `./bin`, `./helm`, `./constants`, `./version-bump` and `./types`.
**`src/utils` is intentionally not re-exported** — it is internal. Tests that need it import
from `src/utils` directly.

## Separation of Concerns

- **Chart discovery & ordering** → `HelmChartManager`
- **Chart state & serialization** → `HelmChartContainer` / `HelmChartDependencyContainer`
- **External process execution** → `Binary` subclasses behind `IBinary`
- **User input normalization** → `helm/chart/helpers/*`
- **User interaction** → `src/cli/*`
