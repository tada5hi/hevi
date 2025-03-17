/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { x } from 'tinyexec';

export async function executeShellCommand(ctx: {
    cmd: string,
    args: string[],
    cwd?: string
}) : Promise<string> {
    const output = await x(ctx.cmd, ctx.args, {
        nodeOptions: {
            cwd: ctx.cwd,
        },
    });

    if (
        output.exitCode &&
        output.exitCode > 0
    ) {
        throw new Error(output.stderr || `An unknown error occurred while executing: ${ctx.cmd} ${ctx.args.join(' ')}`);
    }

    return output.stdout;
}
