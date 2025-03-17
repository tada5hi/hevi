/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildFilePath, load, locateMany } from 'locter';
import path from 'node:path';
import type { HelmChart, HelmChartsFindOptions } from './types';

export async function readHelmChart(file: string, cwd?: string) : Promise<HelmChart> {
    // todo: maybe validate content
    const relativePath = path.relative(cwd || process.cwd(), file);
    return {
        meta: {
            path: relativePath
                .replaceAll(path.win32.sep, path.posix.sep),
            pathAbsolute: file,
            directoryPath: path.dirname(relativePath)
                .replaceAll(path.win32.sep, path.posix.sep),
            directoryPathAbsolute: path.dirname(file),
        },
        ...await load(file),
    };
}

export async function findHelmCharts(options: HelmChartsFindOptions = {}): Promise<HelmChart[]> {
    const locations = await locateMany('**/Chart.{yml,yaml}', {
        ignore: ['node_modules/**'],
        onlyFiles: true,
        path: options.cwd,
    });

    if (locations.length === 0) {
        return [];
    }

    const files = locations.map(
        (location) => readHelmChart(buildFilePath(location), options.cwd),
    );

    return Promise.all(files);
}
