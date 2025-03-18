/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Options } from 'tinyexec';
import { x } from 'tinyexec';

export async function executeShellCommand(
    cmd: string,
    args: string[] = [],
    options : Partial<Options> = {},
) : Promise<string> {
    const output = await x(cmd, args, options);

    if (
        output.exitCode &&
        output.exitCode > 0
    ) {
        throw new Error(output.stderr || `An unknown error occurred while executing: ${cmd} ${args.join(' ')}`);
    }

    return output.stdout;
}
