/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

export type GitOptions = {
    cwd?: string,
};

export type GitCommitOptions = GitOptions & {
    userName: string,
    userEmail: string,
    author?: string,
    message: string
    cwd?: string
};

export type GitPushOptions = GitOptions & {
    branch?: string,
};
