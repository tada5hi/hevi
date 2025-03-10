import { getOctokit } from '@actions/github';
import { defineCommand } from 'citty';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { setGithubClientFactory } from '../github';
import { findHelmCharts, setHelmChartsVersion } from '../helm';
import { HelmVersionType } from '../constants';
import { execute } from '../module';

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
            commit: {
                type: 'boolean',
                description: 'Commit git changes',
                default: true,
            },
            push: {
                type: 'boolean',
                description: 'Push git changes',
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
                options: Object.values(HelmVersionType),
            },
        },
        async setup(ctx) {
            await execute({
                cwd: ctx.args.cwd,
                directory: ctx.args.directory,
                version: ctx.args.version,
                versionType: ctx.args.versionType,
                githubToken: ctx.args.githubToken,
                commit: ctx.args.commit,
                push: ctx.args.push,
            });

            process.exit(0);
        },
    });
}
