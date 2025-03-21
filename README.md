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

## Installation

```bash
npm install hevi --save-dev
```

## Usage

### Versionize

```bash
npx hevi versionize <directory> \
  --version <version> \
  --commit
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

