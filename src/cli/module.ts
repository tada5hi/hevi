import { getOctokit } from '@actions/github';
import { defineCommand } from 'citty';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { setGithubClientFactory } from '../github';
import { findHelmCharts, setHelmChartsVersion } from '../helm';

export async function createCLIEntryPointCommand() {
    const pkgRaw = await fs.promises.readFile(
        path.join(process.cwd(), 'package.json'),
        { encoding: 'utf8' },
    );
    const pkg = JSON.parse(pkgRaw);

    return defineCommand({
        meta: {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description,
        },
        args: {
            cwd: {
                type: 'string',
                description: 'Config directory path',
                default: process.cwd(),
            },
            directory: {
                type: 'string',
                description: 'Relative directory path (default: .)',
            },
            release: {
                type: 'boolean',
                description: 'Release changes (commit & push)',
                default: true,
            },
            githubToken: {
                type: 'string',
                description: 'GitHub token',
                default: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
            },
            version: {
                type: 'string',
                description: 'Set specific version',
            },
            versionType: {
                type: 'string',
            },
        },
        async setup(ctx) {
            if (ctx.args.githubToken) {
                setGithubClientFactory(() => getOctokit(ctx.args.githubToken));
            }

            const charts = await findHelmCharts({
                cwd: ctx.args.cwd,
                // directory: ctx.args.directory,
            });

            if (ctx.args.version) {
                setHelmChartsVersion(charts, ctx.args.version);
            }
        },
    });
}
