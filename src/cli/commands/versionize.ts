/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';
import consola from 'consola';
import { isObject } from 'locter';
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

                for (let i = 0; i < charts.length; i++) {
                    consola.success(
                        `versionized chart ${charts[i].data.name} (${charts[i].directoryPathRelativePosix})`,
                        { version: charts[i].data.version, appVersion: charts[i].data.appVersion },
                    );
                }

                process.exit(0);
            } catch (e) {
                if (isObject(e)) {
                    consola.warn(e?.message || 'An unknown error occurred.');
                }
                process.exit(1);
            }
        },
    });
}
