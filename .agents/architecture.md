# Architecture

## System Overview

```
        ┌────────────────────────────┐
        │  src/cli/* (citty)         │  thin adapters, consola output, exit codes
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │  HelmChartManager          │  discovery, dependency graph, orchestration
        └───┬────────────────────┬───┘
            │                    │
 ┌──────────▼──────────┐  ┌──────▼────────────────┐
 │ HelmChartContainer  │  │ IBinary               │  abstraction over an executable
 │ + Dependency        │  │  ├── HelmBinary       │  -> helm
 │ (Chart.yaml state)  │  │  └── HelmChartReleaser│  -> cr
 └──────────┬──────────┘  └──────┬────────────────┘
            │                    │
        file system         child process / HTTP download
```

## Overview

The architecture is a small **orchestrator + containers + ports** design:

- **Containers** (`HelmChartContainer`, `HelmChartDependencyContainer`) own the parsed state of a
  single `Chart.yaml` and know how to mutate and serialize it. They perform no process execution.
- **The orchestrator** (`HelmChartManager`) owns cross-chart concerns: discovery, the dependency
  graph, topological ordering and the command sequences handed to the binaries.
- **Ports** (`IBinary`) abstract everything that leaves the process. This is the seam that makes
  the manager testable without a real `helm` installation.

## Core Design Decisions

### 1. Charts are processed in reverse topological order

`file://` dependencies form a directed graph (`chart -> dependency`). `topologicalSort(graph).reverse()`
yields leaves first, so a dependency is always versioned/packaged **before** the chart that
consumes it. After a chart is versioned, the manager walks its adjacent nodes and lifts the new
version into the parent's `dependencies[].version` entry — this is what keeps `foo`'s dependency on
`bar` in sync when both are bumped.

### 2. Binaries are resolved lazily, then cached on disk

`Binary.execute()` first tries `which <name>`. Only if that fails is the archive downloaded into
`RUNNER_TOOL_CACHE` (GitHub Actions) or the OS temp dir, keyed by `version/platform/arch`, then
`chmod 0755`-ed. This means a locally installed `helm` always wins, and CI runs get a cached
download per version.

### 3. Depend on interfaces, not concrete classes

Classes are abstracted behind `I`-prefixed interfaces and consumers reference the interface.
`HelmChartManager` holds `IBinary`, not `HelmBinary`, which lets tests plug in fakes.

## Design Patterns

### Port + implementation

The port, in `src/bin/types.ts`:

```typescript
export interface IBinary {
    execute(args: string[]) : Promise<string>;
    download() : Promise<void>;
    readonly directory : string;
    readonly name : string;
    readonly path : string;
}
```

The shared implementation, in `src/bin/module.ts`:

```typescript
export abstract class Binary implements IBinary {
    protected constructor(options: BinaryOptions, versionDefault: string) {
        this.version = options.version || versionDefault;
        this.platform = options.platform || os.platform();
        this.arch = options.arch || os.arch();
        this.cwd = options.cwd || process.cwd();
    }

    abstract download() : Promise<void>;
    abstract get directory() : string;
    abstract get name() : string;
    abstract get path() : string;
}
```

Concrete binaries only supply their default version, download URL and file layout:

```typescript
export class HelmBinary extends Binary {
    constructor(options: HelmBinOptions = {}) {
        super(options, '4.2.3');
    }
    // download(), downloadURL, directory, name, path
}
```

### Optional constructor injection

Collaborators default to the real implementation but can be replaced:

```typescript
constructor(options: HelmChartManagerOptions = {}) {
    this.helmBinary = options.helmBinary || new HelmBinary();
    this.helmChartReleaserBinary = options.helmChartReleaserBinary || new HelmChartReleaserBinary();
}
```

Production callers write `new HelmChartManager()`; tests write
`new HelmChartManager({ helmBinary: new FakeBinary('helm') })`.

### Option normalization

Every public option object has a `*Options` input type and a `*OptionsNormalized` resolved type,
with a `normalize*` function bridging them. Defaults and environment fallbacks live in the
normalizer, never in the consuming code.

```typescript
export function normalizeHelmChartsVersionOptions(
    input: HelmChartsVersionizeOptions = {},
) : HelmChartsVersionOptionsNormalized {
    return { dryRun: input.dryRun ?? false, version: input.version };
}
```

## Data Flow

```
Input:
  └── a directory containing one or more Chart.{yml,yaml} files

Processing:
  1. locateMany('**/Chart.{yml,yaml}', { cwd, ignore: ['node_modules/**'] })
  2. read() each file -> new HelmChartContainer(data, { path })
  3. register a graph node per chart directory; add an edge per file:// dependency
  4. topologicalSort(graph).reverse()  -> leaves first
  5. per chart: set/bump version, propagate the new version into dependent charts,
     then save() unless dryRun
  6. (package/release/push) run helm / cr with the assembled argument lists

Output:
  └── rewritten Chart.yaml files, .hevi/packages/*.tgz, .hevi/index/index.yaml,
      or charts uploaded to GitHub Pages / an OCI registry
```

## Error Handling

- `executeShellCommand()` throws when the child process exits non-zero, using `stderr` as message.
- `Binary.execute()` swallows failures of the `which` probe and of the `access` checks — those are
  control flow, not errors — but propagates download and execution failures.
- CLI commands catch, log via `consola` and `process.exit(1)`.
- Thrown values are normalized with `extractErrorMessage()` (`src/utils/error.ts`), which handles
  `Error` instances, plain strings and objects carrying a string `message`, since JavaScript allows
  throwing any value.

## File Structure

```text
Ports          src/bin/types.ts                    (IBinary)
               src/helm/chart/types.ts             (IHelmChartContainer, IHelmChartManager, ...)
Implementations src/bin/module.ts, src/bin/helm/*, src/bin/helm-chart-releaser/*
               src/helm/chart/module.ts, src/helm/chart/dependency/module.ts
Orchestration  src/helm/chart/manager.ts
Adapters       src/cli/commands/*
Infrastructure src/utils/*
```

## Configuration

The library takes configuration through option objects. The CLI additionally loads `.env`
(`dotenv`) and falls back to the environment:

| Variable            | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| `GITHUB_TOKEN`      | Token for `release`; preferred over `GH_TOKEN`                          |
| `GH_TOKEN`          | Fallback token for `release`                                            |
| `GITHUB_REPOSITORY` | Source of `owner`/`repo` via `@actions/github` context                  |
| `GITHUB_REF`        | Presence triggers owner/repo inference from the Actions context         |
| `RUNNER_TOOL_CACHE` | Base directory for downloaded binaries (otherwise `os.tmpdir()`)        |

Output locations are fixed constants relative to the current working directory:
`.hevi/packages` and `.hevi/index` (`src/helm/chart/constants.ts`).
