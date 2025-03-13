/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { normalizeExecuteOptions } from './normalize';
import type { ExecuteOptions } from './types';
import type { HelmChart } from '../../helm';
import {
    bumpHelmChartVersion,
    findHelmCharts,
    setHelmChartVersion,
    writeHelmCharts,
} from '../../helm';
import { executeGitCommit, executeGitPush } from '../../git';
import type { GitCommitOptions } from '../../git';
import { buildDisplayNameEmail } from '../../utils';

export async function execute(input: ExecuteOptions) : Promise<HelmChart[]> {
    const options = normalizeExecuteOptions(input);
    const directoryPath = path.join(options.cwd, options.directory);

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

    if (options.commit) {
        await writeHelmCharts(charts);

        const commitOptions : GitCommitOptions = {
            cwd: options.cwd,
            message: 'chore: update helm charts',
            userName: options.commitUserName,
            userEmail: options.commitUserEmail,
            author: options.commitAuthor ?
                options.commitAuthor :
                buildDisplayNameEmail(options.commitUserName, options.commitUserEmail),
        };

        await executeGitCommit(commitOptions);

        if (options.push) {
            await executeGitPush({
                cwd: options.cwd,
                branch: options.branch,
            });
        }
    }

    return charts;
}
