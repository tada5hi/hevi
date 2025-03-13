/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { BaseCommandOptions, BaseCommandOptionsNormalized } from '../types';

export type ReleaseCommandOptions = BaseCommandOptions & {
    /**
     * git repository
     */
    repo?: string,

    /**
     * git owner
     */
    owner?: string,

    /**
     * branch to upload charts + index file
     */
    branch?: string,

    /**
     * upload charts + index file?
     */
    upload?: boolean
};

export type ReleaseCommandOptionsNormalized = BaseCommandOptionsNormalized & {

    /**
     * git repository
     */
    repo: string,

    /**
     * git owner
     */
    owner: string,

    /**
     * branch to upload charts + index file
     */
    branch?: string,

    /**
     * upload charts + index file?
     */
    upload: boolean
};
