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

export function defineCLIPushCommand() {
    return defineCommand({
        meta: {
            name: 'push',
            description: 'Push packaged helm charts to a remote registry.',
        },
        args: {
            directory: {
                type: 'positional',
                default: '.',
                description: 'Relative directory path (default: .)',
            },
            host: {
                type: 'string',
                description: 'Registry host (e.g. ghcr.io)',
                required: true,
            },
            username: {
                type: 'string',
                description: 'Registry username',
                required: true,
            },
            password: {
                type: 'string',
                description: 'Registry password',
                required: true,
            },
            skipExisting: {
                type: 'boolean',
                description: 'Skip charts whose version already exists in the registry.',
                default: false,
            },
        },
        async setup(ctx) {
            const manager = new HelmChartManager();
            await manager.loadMany(ctx.args.directory);

            try {
                const charts = await manager.pushCharts({
                    host: ctx.args.host,
                    username: ctx.args.username,
                    password: ctx.args.password,
                    skipExisting: ctx.args.skipExisting,
                });

                for (const chart of charts) {
                    consola.success(`pushed chart ${chart.data.name} (${chart.pathRelativePosix})`);
                }

                process.exit(0);
            } catch (e) {
                consola.error(extractErrorMessage(e));
                process.exit(1);
            }
        },
    });
}
