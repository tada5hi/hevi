/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';
import { HelmChartReleaserBinary } from '../../bin';

export function defineCLIHelmChartReleaserCommand() {
    return defineCommand({
        meta: {
            name: 'helm-chart-releaser',
        },
        args: {
            command: {
                type: 'positional',
                default: '.',
                description: 'Helm command',
            },
        },
        async setup(ctx) {
            const binary = new HelmChartReleaserBinary();

            const output = await binary.execute(ctx.rawArgs);
            console.log(output);
        },
    });
}
