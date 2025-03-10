/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import spawn from 'cross-spawn';
import type { SpawnOptions } from 'node:child_process';
import type { GitCommitOptions, GitPushOptions } from './types';

/**
 * @see https://github.com/stefanzweifel/git-auto-commit-action/blob/master/entrypoint.sh
 *
 * @param options
 */
export async function executeGitCommit(options: GitCommitOptions) {
    const spawnOptions : SpawnOptions = {
        cwd: options.cwd,
        stdio: 'inherit',
        detached: false,
    };

    spawn.sync('git', [
        `-c user.name=${options.userName}`,
        `-c user.email=${options.userEmail}`,
        `commit -m "${options.message}"`,
        `--author=${options.author}`,
    ], spawnOptions);
}

export async function executeGitPush(options: GitPushOptions) {
    const spawnOptions : SpawnOptions = {
        cwd: options.cwd,
        stdio: 'inherit',
        detached: false,
    };

    if (options.branch) {
        spawn.sync(
            'git',
            [
                'push',
                `--set-upstream origin "HEAD:${options.branch}"`,
                '--follow-tags',
                '--atomic',
            ],
            spawnOptions,
        );

        return;
    }

    spawn.sync(
        'git',
        [
            'push',
            '--follow-tags',
            '--atomic',
        ],
        spawnOptions,
    );
}
