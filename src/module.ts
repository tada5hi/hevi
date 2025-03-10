/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { getOctokit } from '@actions/github';
import path from 'node:path';
import type { ExecuteOptions } from './types';
import { setGithubClientFactory } from './github';
import type { HelmChart } from './helm';
import {
    bumpHelmChartVersion,
    findHelmCharts, serializeHelmChart, setHelmChartVersion, writeHelmCharts,
} from './helm';
import { changeGithubFileContent } from './github/file';

export async function execute(options: ExecuteOptions) : Promise<HelmChart[]> {
    const cwd = options.cwd || process.cwd();
    const directory = options.directory || '.';

    const directoryPath = path.join(cwd, directory);

    if (options.githubToken) {
        setGithubClientFactory(() => getOctokit(options.githubToken!));
    }

    const charts = await findHelmCharts({
        cwd: directoryPath,
    });

    for (let i = 0; i < charts.length; i++) {
        if (options.version) {
            setHelmChartVersion(charts[i], options.version, options.versionType);
        } else {
            bumpHelmChartVersion(charts[i], options.versionType);
        }
    }

    if (
        options.commit &&
        options.push &&
        options.githubToken
    ) {
        for (let i = 0; i < charts.length; i++) {
            await changeGithubFileContent({
                content: serializeHelmChart(charts[i]),
                path: charts[i].hevi.path,
                message: `feat: update helm chart ${charts[i].hevi.path} version (${charts[i].version}) & appVersion (${charts[i].appVersion})`,
            });
        }
    }

    if (options.commit) {
        await writeHelmCharts(charts);

        // todo: git commit
    }

    return charts;
}
