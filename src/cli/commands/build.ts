/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';
import consola from 'consola';
import process from 'node:process';
import { HelmChartsManager } from '../../helm';

export function defineCLIBuildCommand() {
    return defineCommand({
        meta: {
            name: 'build',
        },
        args: {
            cwd: {
                type: 'string',
                default: process.cwd(),
                description: 'Working directory path',
            },
            directory: {
                type: 'positional',
                default: '.',
                description: 'Relative directory path (default: .)',
            },
        },
        async setup(ctx) {
            const manager = new HelmChartsManager({
                cwd: ctx.args.cwd,
                directory: ctx.args.directory,
            });

            try {
                const charts = await manager.buildCharts();

                for (let i = 0; i < charts.length; i++) {
                    consola.success(`built chart ${charts[i].name} (${charts[i].meta.directoryPath})`);
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
