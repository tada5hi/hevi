/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Output } from 'tinyexec';
import { x } from 'tinyexec';
import type { GitCommitOptions, GitPushOptions } from './types';
import { buildDisplayNameEmail } from '../utils';

/**
 * @see https://github.com/stefanzweifel/git-auto-commit-action/blob/master/entrypoint.sh
 *
 * @param options
 */
export async function executeGitCommit(options: GitCommitOptions) {
    const output = await x('git', [
        '-c',
        `user.name=${options.userName}`,
        '-c',
        `user.email=${options.userEmail}`,
        'commit',
        '--amend',
        '-m',
        `${options.message}`,
        '--author',
        `${options.author ? options.author : buildDisplayNameEmail(options.userName, options.userEmail)}`,
    ], {
        nodeOptions: {
            cwd: options.cwd,
        },
    });

    if (output.stderr) {
        throw new Error(output.stderr);
    }
}

export async function executeGitPush(options: GitPushOptions) {
    let output: Output;

    if (options.branch) {
        output = await x(
            'git',
            [
                'push',
                '--set-upstream',
                'origin',
                `HEAD:${options.branch}`,
                '--follow-tags',
                '--atomic',
            ],
            {
                nodeOptions: {
                    cwd: options.cwd,
                },
            },
        );
    } else {
        output = await x(
            'git',
            [
                'push',
                '--follow-tags',
                '--atomic',
            ],
            {
                throwOnError: false,
                nodeOptions: {
                    cwd: options.cwd,
                },
            },
        );
    }

    if (output.stderr) {
        throw new Error(output.stderr);
    }
}
