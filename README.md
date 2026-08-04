<p align="center">
    <img src=".github/assets/logo.svg" alt="" width="96" height="96">
</p>

<h1 align="center">Hevi</h1>

<p align="center">Versioner &amp; Releaser for Helm Charts</p>

<p align="center">
    <a href="https://badge.fury.io/js/hevi"><img src="https://badge.fury.io/js/hevi.svg" alt="npm version"></a>
    <a href="https://github.com/Tada5hi/hevi"><img src="https://github.com/Tada5hi/hevi/workflows/CI/badge.svg" alt="Master Workflow"></a>
    <a href="https://snyk.io/test/github/Tada5hi/hevi?targetFile=package.json"><img src="https://snyk.io/test/github/Tada5hi/hevi/badge.svg?targetFile=package.json" alt="Known Vulnerabilities"></a>
    <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&amp;logoColor=white" alt="Conventional Commits"></a>
</p>

Hevi scans a directory for `Chart.yaml` files, builds a dependency graph from their
`file://` dependencies, and then versions, packages, releases and pushes them in the
right order, so an umbrella chart never ships pointing at a stale subchart version.

The `helm` and `cr` (helm chart-releaser) binaries are used under the hood. They are
taken from `PATH` when available, otherwise downloaded once and cached, so nothing has
to be installed up front.

**Table of Contents**
- [Installation](#installation)
- [How it works](#how-it-works)
- [CLI](#cli)
  - [versionize](#versionize)
  - [package](#package)
  - [push](#push)
  - [release](#release)
  - [helm / helmChartReleaser](#helm--helmchartreleaser)
- [GitHub Action](#github-action)
- [Recipes](#recipes)
- [Programmatic usage](#programmatic-usage)
- [Environment](#environment)
- [License](#license)

## Installation

```bash
npm install hevi --save-dev
```

Requires **Node.js >= 22**. The package is **ESM only**.

## How it works

Given a directory of charts where an umbrella chart depends on a local subchart:

```yaml
# charts/foo/Chart.yaml
name: foo
version: 0.1.0
dependencies:
    -   name: bar
        version: 0.1.0
        repository: file://../bar
```

`hevi versionize` bumps every chart and rewrites the dependency entry to match, in one pass:

```
charts/bar   0.1.0 -> 0.1.1
charts/foo   0.1.0 -> 0.1.1   (dependencies[bar].version -> 0.1.1)
```

Charts are always processed dependency-first (reverse topological order), which also
determines the order in which they are packaged and pushed.

Build artifacts are written relative to the current working directory:

| Path              | Content                                     |
|-------------------|---------------------------------------------|
| `.hevi/packages`  | Packaged `<name>-<version>.tgz` archives    |
| `.hevi/index`     | Generated `index.yaml`                      |

## CLI

```bash
npx hevi <command> [directory] [options]
```

Every command takes an optional `directory` positional (default `.`), the relative path
that is scanned recursively for `Chart.{yml,yaml}`. `node_modules` is ignored.

### versionize

Bump or set the version of every chart, propagating new versions into dependent charts.

```bash
npx hevi versionize <directory> --version <version> --dryRun
```

| Option      | Type      | Default | Description                                                      |
|-------------|-----------|---------|------------------------------------------------------------------|
| `directory` | positional| `.`     | Relative path where the helm charts are located.                  |
| `--version` | string    | –       | Semver version to set. Omit to bump the patch version instead.    |
| `--dryRun`  | boolean   | `false` | Report what would change without writing to the file system.      |

### package

Package every chart into `.hevi/packages`. Runs `helm dependency update` first, and
temporarily registers any `http(s)` chart repositories the dependencies reference.

```bash
npx hevi package <directory>
```

### push

Push the packaged charts to an OCI registry.

```bash
npx hevi push <directory> \
    --host <host> \
    --username <username> \
    --password <password>
```

| Option       | Type   | Required | Description                        |
|--------------|--------|----------|------------------------------------|
| `--host`     | string | yes      | Push target, e.g. `ghcr.io` or `ghcr.io/acme/charts`. Authentication uses the bare registry. |
| `--username` | string | yes      | Registry username.                 |
| `--password` | string | yes      | Registry password or token.        |
| `--skipExisting` | boolean | no  | Skip charts whose version already exists in the registry. |

Run `package` first, since `push` uploads the archives from `.hevi/packages`.

### release

Upload the packaged charts as GitHub releases and publish the repository index to a
GitHub Pages branch, via `cr`.

```bash
npx hevi release <directory> \
    --owner <owner> \
    --repo <repo> \
    --branch <branch> \
    --token <token>
```

| Option     | Type   | Default    | Description                                                       |
|------------|--------|------------|-------------------------------------------------------------------|
| `--owner`  | string | inferred   | GitHub user or organization.                                      |
| `--repo`   | string | inferred   | GitHub repository name.                                           |
| `--branch` | string | `gh-pages` | Branch the charts and `index.yaml` are published to.               |
| `--commit` | string | `GITHUB_SHA` | Commit the created releases point to. Required outside of GitHub Actions. |
| `--token`  | string | inferred   | Git token.                                                        |
| `--generateReleaseNotes` | boolean | `false` | Let GitHub generate the release name and body from merged pull requests. |

Inside GitHub Actions, `--owner`, `--repo`, `--commit` and `--token` are read from the environment
(see [Environment](#environment)), so they can usually be omitted. Existing releases are
skipped, making re-runs safe.

### helm / helmChartReleaser

Run the managed binaries directly. Useful when you want hevi's download-and-cache
behaviour but a command it does not wrap.

```bash
npx hevi helm version
npx hevi helmChartReleaser --help
```

## GitHub Action

This repository ships a composite action, so no separate action package has to be
installed or kept in sync. Each phase is opt-in and they run in the order
versionize, package, release, push.

```yaml
- uses: tada5hi/hevi@v2
  with:
      directory: charts
      versionize: true
      package: true
      release: true
```

| Input            | Default        | Description                                                       |
|------------------|----------------|-------------------------------------------------------------------|
| `directory`      | `charts`       | Directory scanned for `Chart.{yml,yaml}` files.                    |
| `versionize`     | `false`        | Bump or set the version of every chart.                            |
| `version`        | –              | Explicit semver version. Bumps the patch version when empty.       |
| `dry-run`        | `false`        | Run versionize without writing.                                    |
| `package`        | `false`        | Package the charts into `.hevi/packages`.                          |
| `release`        | `false`        | Release the packaged charts to GitHub.                             |
| `release-owner`  | inferred       | GitHub owner.                                                      |
| `release-repo`   | inferred       | GitHub repository name.                                            |
| `release-branch` | `gh-pages`     | Branch the charts and `index.yaml` are published to.               |
| `release-commit` | `github.sha`   | Commit the created releases point to.                              |
| `release-generate-notes` | `false` | Let GitHub generate the release name and body.               |
| `token`          | `github.token` | Token used to interact with GitHub.                                |
| `push`           | `false`        | Push the packaged charts to an OCI registry.                       |
| `push-host`      | –              | Push target, e.g. `ghcr.io/acme/charts`.                           |
| `push-username`  | –              | Registry username.                                                 |
| `push-password`  | –              | Registry password or token.                                        |
| `push-skip-existing` | `false`    | Skip charts whose version already exists in the registry.          |
| `node-version`   | `24`           | Node.js version to set up. Set to an empty string to skip setup.   |

The action builds hevi from its own checkout, so the ref it is pinned to is exactly the
code that runs and no npm release is required.

## Recipes

### Bump every chart and preview the result

```bash
npx hevi versionize ./charts --dryRun
```

### Pin an entire chart directory to one version

Handy when charts are released together with the application they deploy.

```bash
npx hevi versionize ./charts --version 1.4.0
```

### Publish to GitHub Pages from GitHub Actions

```yaml
name: Release Charts

on:
    push:
        branches: [master]

permissions:
    contents: write

jobs:
    release:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v6
              with:
                  fetch-depth: 0

            - uses: tada5hi/hevi@v2
              with:
                  directory: charts
                  versionize: true
                  package: true
                  release: true
```

`git config user.*` and a commit step are needed if the bumped `Chart.yaml`
files should be written back to the branch.

### Publish to an OCI registry (GHCR)

```yaml
            - uses: tada5hi/hevi@v2
              with:
                  directory: charts
                  package: true
                  push: true
                  push-host: ghcr.io
                  push-username: ${{ github.actor }}
                  push-password: ${{ secrets.GITHUB_TOKEN }}
```

The CLI can be driven directly instead, if the phases need to be interleaved with
other steps:

```yaml
            - run: npx hevi package ./charts
            - run: |
                  npx hevi push ./charts \
                      --host ghcr.io \
                      --username ${{ github.actor }} \
                      --password ${{ secrets.GITHUB_TOKEN }}
```

### Pin the helm version

Both binaries default to a known-good version (`helm` 4.2.3, `cr` 1.8.1) and are only
downloaded when they are not already on `PATH`. Install a specific `helm` in CI to take
control:

```yaml
            - uses: azure/setup-helm@v4
              with:
                  version: v3.21.3
            - uses: tada5hi/hevi@v2
              with:
                  package: true
```

### Exit codes

Every command exits `1` when the underlying `helm` / `cr` invocation fails, so no extra
error handling is needed to fail a pipeline step. Note that `--dryRun` only suppresses
writes. It always exits `0` and is not a drift check.

## Programmatic usage

Everything the CLI does is available as a library.

```typescript
import { HelmChartManager } from 'hevi';

const manager = new HelmChartManager();
await manager.loadMany('./charts');

const charts = await manager.versionizeCharts({ version: '1.4.0' });

for (const chart of charts) {
    console.log(chart.data.name, chart.data.version);
}

await manager.packageCharts();
await manager.pushCharts({
    host: 'ghcr.io',
    username: 'user',
    password: process.env.REGISTRY_TOKEN!,
});
```

### Bumping a single version

```typescript
import { bumpVersion } from 'hevi';

bumpVersion('1.2.3');          // '1.2.4'
bumpVersion('1.2.3', 'minor'); // '1.3.0'
```

### Swapping the binaries

`HelmChartManager` depends on the `IBinary` interface, so a different version (or a
fake, in tests) can be supplied:

```typescript
import { HelmBinary, HelmChartManager } from 'hevi';

const manager = new HelmChartManager({
    helmBinary: new HelmBinary({ version: '3.21.3' }),
});
```

## Environment

A `.env` file is loaded automatically by the CLI.

| Variable            | Used by   | Purpose                                                          |
|---------------------|-----------|------------------------------------------------------------------|
| `GITHUB_TOKEN`      | `release` | Git token; preferred over `GH_TOKEN`.                            |
| `GH_TOKEN`          | `release` | Fallback git token.                                              |
| `GITHUB_REPOSITORY` | `release` | Source of `owner`/`repo` when they are not passed explicitly.    |
| `GITHUB_SHA`        | `release` | Source of `commit` when it is not passed explicitly.             |
| `RUNNER_TOOL_CACHE` | all       | Cache directory for downloaded binaries; defaults to the temp dir.|

## License

Made with 💚

Published under [MIT License](./LICENSE).
