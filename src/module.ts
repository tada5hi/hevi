/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { getOctokit } from '@actions/github';
import path from 'node:path';
import process from 'node:process';
import type { ExecuteOptions } from './types';
import { setGithubClientFactory } from './github';
import type { HelmChart } from './helm';
import {
    bumpHelmChartVersion,
    findHelmCharts,
    serializeHelmChart,
    setHelmChartVersion,
    writeHelmCharts,
} from './helm';
import { changeGithubFileContent } from './github/file';
import { Provider } from './constants';
import { executeGitCommit, executeGitPush } from './git';
import type { GitCommitOptions } from './git';

export async function execute(options: ExecuteOptions) : Promise<HelmChart[]> {
    const cwd = options.cwd || process.cwd();
    const directory = options.directory || '.';

    const directoryPath = path.join(cwd, directory);

    let { provider } = options;
    if (!provider && (process.env.GITHUB_TOKEN || process.env.GH_TOKEN)) {
        provider = Provider.GITHUB;
    }

    if (provider === Provider.GITHUB) {
        /**
         * @see https://github.com/actions/toolkit/blob/main/packages/github/src/context.ts
         */

        if (!options.branch) {
            options.branch = process.env.GITHUB_REF;
        }

        if (
            !options.commitUserEmail &&
            !options.commitUserName
        ) {
            options.commitUserEmail = 'github-actions[bot]';
            options.commitUserName = '41898282+github-actions[bot]@users.noreply.github.com';
        }

        if (!options.token) {
            options.token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        }

        if (options.token) {
            setGithubClientFactory(() => getOctokit(options.token!));
        }
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
        options.push
    ) {
        if (
            options.token &&
            provider === Provider.GITHUB
        ) {
            for (let i = 0; i < charts.length; i++) {
                await changeGithubFileContent({
                    content: serializeHelmChart(charts[i]),
                    path: charts[i].hevi.path,
                    message: `feat: update helm chart ${charts[i].hevi.path} version (${charts[i].version}) & appVersion (${charts[i].appVersion})`,
                });
            }
        }
    }

    if (options.commit) {
        await writeHelmCharts(charts);

        if (!options.commitUserEmail || !options.commitUserName) {
            throw new Error('The options commiterUserEmail & commiterUserName are required to commit changes.');
        }

        const commitOptions : GitCommitOptions = {
            cwd,
            message: 'chore: update helm charts',
            userName: options.commitUserName,
            userEmail: options.commitUserEmail,
            author: options.commitAuthor ?
                options.commitAuthor :
                options.commitUserName,
        };

        await executeGitCommit(commitOptions);

        if (options.push) {
            await executeGitPush({
                cwd,
                branch: options.branch,
            });
        }
    }

    return charts;
}
