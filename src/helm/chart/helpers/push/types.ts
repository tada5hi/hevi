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

    /**
     * Let GitHub generate the name and body of the release from the merged
     * pull requests, instead of falling back to the chart description.
     *
     * Only relevant when chart-releaser owns the release creation, which is
     * the case when release-please runs with skip-github-release.
     *
     * default: false
     */
    generateReleaseNotes?: boolean,
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

    /**
     * Let GitHub generate the name and body of the release.
     *
     * default: false
     */
    generateReleaseNotes: boolean,
};
