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

export function defineCLIPackageCommand() {
    return defineCommand({
        meta: {
            name: 'package',
            description: 'Package helm charts to .helm-packages',
        },
        args: {
            directory: {
                type: 'positional',
                default: '.',
                description: 'Relative directory path (default: .)',
            },
        },
        async setup(ctx) {
            const manager = new HelmChartManager();
            await manager.loadMany(ctx.args.directory);

            try {
                const charts = await manager.packageCharts();
                for (const chart of charts) {
                    consola.success(`packaged chart ${chart.data.name} (${chart.pathRelativePosix})`);
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
