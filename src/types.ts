/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ReleaseType } from 'semver';
import type { HelmVersionType } from './constants';

export type Options = {
    /**
     * default: process.cwd()
     */
    cwd?: string,

    /**
     * default: patch
     */
    level?: `${ReleaseType}`,

    /**
     * default: undefined
     */
    versionType?: `${HelmVersionType}`,

    /**
     * if not defined, patched version.
     */
    version?: string
};
