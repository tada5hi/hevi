/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HelmVersionType } from './constants';

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
     * default: true
     */
    commit?: boolean,

    /**
     * default: true
     */
    push?: boolean,

    /**
     * default: undefined
     */
    githubToken?: string,

    /**
     * if not defined, patched version.
     */
    version?: string

    /**
     * default: undefined
     */
    versionType?: `${HelmVersionType}` | string,
};
