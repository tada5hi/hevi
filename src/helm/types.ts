/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HelmChartsReadOptions = {
    cwd?: string
};

export type HelmChart = {
    hevi: {
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
