/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { x } from 'tinyexec';
import type { GitCommitOptions, GitPushOptions } from './types';
import { buildDisplayNameEmail } from '../utils';

export async function executeGitCommand(ctx: {args: string[], cwd?: string}) {
    const output = await x('git', ctx.args, {
        nodeOptions: {
            cwd: ctx.cwd,
        },
    });

    if (output.stderr) {
        throw new Error(output.stderr);
    }
}

/**
 * @see https://github.com/stefanzweifel/git-auto-commit-action/blob/master/entrypoint.sh
 *
 * @param options
 */
export async function executeGitCommit(options: GitCommitOptions) {
    await executeGitCommand({
        args: [
            '-c',
            `user.name=${options.userName}`,
            '-c',
            `user.email=${options.userEmail}`,
            'commit',
            '-m',
            `${options.message}`,
            '--author',
            `${options.author ? options.author : buildDisplayNameEmail(options.userName, options.userEmail)}`,
        ],
        cwd: options.cwd,
    });
}

export async function executeGitPush(options: GitPushOptions) {
    if (options.branch) {
        await executeGitCommand({
            args: [
                'push',
                '--set-upstream',
                'origin',
                `HEAD:${options.branch}`,
            ],
            cwd: options.cwd,
        });

        return;
    }

    await executeGitCommand({
        args: [
            'push',
            '--set-upstream',
            'origin',
            `HEAD:${options.branch}`,
        ],
        cwd: options.cwd,
    });
}
