/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HelmVersionType } from '../../constants';

export type ExecuteOptions = {
    /**
     * Project root.
     *
     * default: process.cwd()
     */
    cwd?: string,

    /**
     * Relative path in project directory.
     */
    directory?: string,

    /**
     * Git branch.
     */
    branch?: string,

    /**
     * default: true
     */
    commit?: boolean,
    /**
     * format: Display Name <email@address.com>'
     */
    commitUser?: string,
    /**
     * default: github-actions[bot]
     */
    commitUserName?: string,

    /**
     * default: 41898282+github-actions[bot]@users.noreply.github.com
     */
    commitUserEmail?: string,
    /**
     * see @property commitUser
     */
    commitAuthor?: string,
    /**
     * see @property commitUserName
     */
    commitAuthorName?: string,
    /**
     * see @property commitUserEmail
     */
    commitAuthorEmail?: string,

    /**
     * default: true
     */
    push?: boolean,

    /**
     * default: github
     */
    provider?: string,

    /**
     * default: undefined
     */
    token?: string,

    /**
     * if not defined, patched version.
     */
    version?: string

    /**
     * default: undefined
     */
    versionType?: `${HelmVersionType}` | string,
};

export type ExecuteOptionsNormalized = {
    cwd: string,
    directory: string,
    branch?: string,
    commit: boolean,
    commitUserName: string,
    commitUserEmail: string,
    commitAuthor?: string,
    commitAuthorName?: string,
    commitAuthorEmail?: string,
    push: boolean,
    provider?: string,
    token?: string,
    version?: string,
    versionType?: `${HelmVersionType}` | string,
};
