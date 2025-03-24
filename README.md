# Hevi 🛳️

Versioner & Releaser for Helm Charts

[![npm version](https://badge.fury.io/js/hevi.svg)](https://badge.fury.io/js/hevi)
[![Master Workflow](https://github.com/Tada5hi/hevi/workflows/CI/badge.svg)](https://github.com/Tada5hi/hevi)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/hevi/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Tada5hi/hevi?targetFile=package.json)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

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
npx hevi package <directory> \
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
