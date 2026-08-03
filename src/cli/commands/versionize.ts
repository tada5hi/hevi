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

export function defineCLIVersionizeCommand() {
    return defineCommand({
        meta: {
            name: 'versionize',
            description: 'Versionize helm charts',
        },
        args: {
            directory: {
                type: 'positional',
                default: '.',
                description: 'Relative directory path (default: .)',
            },
            dryRun: {
                type: 'boolean',
                description: 'Commit changes to the file system.',
                default: false,
            },
            version: {
                type: 'string',
                description: 'Set specific version',
            },
        },
        async setup(ctx) {
            const manager = new HelmChartManager();
            await manager.loadMany(ctx.args.directory);

            try {
                const charts = await manager.versionizeCharts({
                    version: ctx.args.version,
                    dryRun: ctx.args.dryRun,
                });

                for (const chart of charts) {
                    consola.success(
                        `versionized chart ${chart.data.name} (${chart.directoryPathRelativePosix})`,
                        { version: chart.data.version, appVersion: chart.data.appVersion },
                    );
                }

                process.exit(0);
            } catch (e) {
                consola.warn(
                    e instanceof Error ?
                        e.message :
                        'An unknown error occurred.',
                );
                process.exit(1);
            }
        },
    });
}
