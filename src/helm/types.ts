/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HelmChartsManagerOptions = {
    /**
     * default: .
     */
    directory?: string,

    /**
     * default: process.cwd()
     */
    cwd?: string,
};

export type HelmChartsManagerOptionsNormalized = {
    /**
     * default: .
     */
    directory: string,

    /**
     * default: process.cwd()
     */
    cwd: string,
};

export type HelmChartsFindOptions = {
    cwd?: string
};

export type HelmChart = {
    meta: {
        directoryPath: string,
        directoryPathAbsolute: string,
        path: string,
        pathAbsolute: string,
    },

    apiVersion: string,
    name: string,
    description: string,
    type: 'application' | 'library',
    version: string,
    appVersion: string
};

export type HelmChartsReadOptions = {
    cwd?: string,
    force?: boolean
};
