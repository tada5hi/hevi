/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { x } from 'tinyexec';
import type { GitCommitOptions, GitPushOptions } from './types';
import { buildDisplayNameEmail } from '../utils';

/**
 * @see https://github.com/stefanzweifel/git-auto-commit-action/blob/master/entrypoint.sh
 *
 * @param options
 */
export async function executeGitCommit(options: GitCommitOptions) {
    await x('git', [
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
        throwOnError: true,
        nodeOptions: {
            cwd: options.cwd,
        },
    });
}

export async function executeGitPush(options: GitPushOptions) {
    if (options.branch) {
        await x(
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
                throwOnError: true,
                nodeOptions: {
                    cwd: options.cwd,
                },
            },
        );

        return;
    }

    await x(
        'git',
        [
            'push',
            '--follow-tags',
            '--atomic',
        ],
        {
            throwOnError: true,
            nodeOptions: {
                cwd: options.cwd,
            },
        },
    );
}
