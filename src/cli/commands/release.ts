/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';
import consola from 'consola';
import process from 'node:process';
import { HelmChartManager } from '../../helm';
import { extractErrorMessage } from '../../utils';

export function defineCLIReleaseCommand() {
    return defineCommand({
        meta: {
            name: 'release',
            description: 'Release packaged helm charts to GitHub.',
        },
        args: {
            directory: {
                type: 'positional',
                default: '.',
                description: 'Relative directory path (default: .)',
            },
            owner: {
                type: 'string',
                description: 'Github owner name (user or organization)',
            },
            repo: {
                type: 'string',
                description: 'Github repository name',
            },
            branch: {
                type: 'string',
                description: 'Github pages branch',
            },
            commit: {
                type: 'string',
                description: 'Target commit for the release (default: GITHUB_SHA)',
            },
            token: {
                type: 'string',
                description: 'Git token',
            },
            generateReleaseNotes: {
                type: 'boolean',
                description: 'Let GitHub generate the release name and body from merged pull requests.',
                default: false,
            },
        },
        async setup(ctx) {
            const manager = new HelmChartManager();
            await manager.loadMany(ctx.args.directory);

            try {
                const charts = await manager.releaseCharts({
                    repo: ctx.args.repo,
                    owner: ctx.args.owner,
                    token: ctx.args.token,
                    branch: ctx.args.branch,
                    commit: ctx.args.commit,
                    generateReleaseNotes: ctx.args.generateReleaseNotes,
                });

                for (const chart of charts) {
                    consola.success(`released chart ${chart.data.name} (${chart.pathRelativePosix})`);
                }

                process.exit(0);
            } catch (e) {
                consola.error(extractErrorMessage(e));
                process.exit(1);
            }
        },
    });
}
