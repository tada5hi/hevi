/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';
import { HelmBinary } from '../../bin';

export function defineCLIHelmCommand() {
    return defineCommand({
        meta: {
            name: 'helm',
        },
        args: {
            command: {
                type: 'positional',
                default: '.',
                description: 'Helm command',
            },
        },
        async setup(ctx) {
            const binary = new HelmBinary();

            const output = await binary.execute(ctx.rawArgs);
            console.log(output);
        },
    });
}
