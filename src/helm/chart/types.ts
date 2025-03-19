/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HelmChartManagerOptions = {
    /**
     * default: .
     */
    directory?: string,

    /**
     * default: process.cwd()
     */
    cwd?: string,
};

export type HelmChartManagerOptionsNormalized = {
    /**
     * default: .
     */
    directory: string,

    /**
     * default: process.cwd()
     */
    cwd: string,
};

export type HelmChart = {
    apiVersion: string,
    name: string,
    description: string,
    type: 'application' | 'library',
    version: string,
    appVersion: string,
    dependencies?: HelmChartDependency[],
};

export type HelmChartDependency = {
    name: string,
    version: string,
    repository?: string,
};
