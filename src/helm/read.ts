/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildFilePath, load, locateMany } from 'locter';
import type { HelmChart, HelmChartsReadOptions } from './types';

export async function readHelmChart(file: string) : Promise<HelmChart> {
    // todo: maybe validate content
    return {
        hevi: {
            path: file,
        },
        ...await load(file),
    };
}

export async function findHelmCharts(options: HelmChartsReadOptions = {}): Promise<HelmChart[]> {
    const locations = await locateMany('**/Chart.{yml,yaml}', {
        ignore: ['node_modules/**'],
        onlyFiles: true,
        path: options.cwd,
    });

    if (locations.length === 0) {
        return [];
    }

    const files = locations.map(
        (location) => readHelmChart(buildFilePath(location)),
    );

    return Promise.all(files);
}
