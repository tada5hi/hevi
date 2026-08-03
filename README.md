<p align="center">
    <img src=".github/assets/logo.svg" alt="" width="96" height="96">
</p>

<h1 align="center">Hevi 🛳️</h1>

<p align="center">Versioner &amp; Releaser for Helm Charts</p>

<p align="center">
    <a href="https://badge.fury.io/js/hevi"><img src="https://badge.fury.io/js/hevi.svg" alt="npm version"></a>
    <a href="https://github.com/Tada5hi/hevi"><img src="https://github.com/Tada5hi/hevi/workflows/CI/badge.svg" alt="Master Workflow"></a>
    <a href="https://snyk.io/test/github/Tada5hi/hevi?targetFile=package.json"><img src="https://snyk.io/test/github/Tada5hi/hevi/badge.svg?targetFile=package.json" alt="Known Vulnerabilities"></a>
    <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&amp;logoColor=white" alt="Conventional Commits"></a>
</p>

> 🚧 **Work in Progress**
>
> This project is currently under active development and is not yet ready for production.

**Table of Contents**
- [Installation](#installation)
- [Usage](#usage)
  - [Versionize](#versionize)
  - [Package](#package)
  - [Push](#push)

## Installation

```bash
npm install hevi --save-dev
```

## Usage

### Versionize

Set version of all helm charts in `<directory>` to `<version>`.

```bash
npx hevi versionize <directory> \
  --version <version> \
  --dryRun
```

#### directory (optional)
- Type: `Positional`
- Default: `.`
- Description: Relative path where helm charts are located.

#### version (optional)
- Type: `String`
- Description: Semver version (x.y.z) otherwise existing version will be patched.

#### dryRun (optional)
- Type: `Boolean`
- Default: `false`
- Description: Commit/Write changes to the file system.

### Package

Package all helm charts in `<directory>` to .helm-packages.

```bash
npx hevi package <directory>
```

#### directory (optional)
- Type: `Positional`
- Default: `.`
- Description: Relative path where helm charts are located.

### Push

Push all charts, present in `<directory>` and packaged in .helm-packages to remote oci registry.

```bash
npx hevi push <directory> \
    --host <host> \
    --username <username> \
    --password <password>
```

#### directory (optional)
- Type: `Positional`
- Default: `.`
- Description: Relative path where helm charts are located.

#### host
- Type: `String`
- Description: Registry host e.g. ghcr.io

#### username
- Type: `String`
- Description: Registry username

#### password
- Type: `String`
- Description: Registry password
