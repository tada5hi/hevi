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
            token: {
                type: 'string',
                description: 'Git token',
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
                });

                for (const chart of charts) {
                    consola.success(`released chart ${chart.data.name} (${chart.pathRelativePosix})`);
                }

                process.exit(0);
            } catch (e) {
                if (e instanceof Error) {
                    consola.error(e.message);
                }
            }
        },
    });
}
