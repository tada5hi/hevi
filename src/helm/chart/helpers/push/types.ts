/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

export type HelmChartsReleaseOptions = {
    /**
     * git token
     */
    token?: string,

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
};

export type HelmChartsReleaseOptionsNormalized = {
    /**
     * git token
     */
    token?: string,

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
};
