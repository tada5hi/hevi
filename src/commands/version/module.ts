/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import {
    bumpHelmChartVersion,
    findHelmCharts,
    setHelmChartVersion,
    writeHelmCharts,
} from '../../helm';
import { executeGitCommand, executeGitCommit, executeGitPush } from '../../git';
import { buildDisplayNameEmail } from '../../utils';
import { normalizeVersionCommandOptions } from './normalize';
import type { VersionCommandOptions } from './types';

export async function executeVersionCommand(
    input: VersionCommandOptions,
) {
    const options = normalizeVersionCommandOptions(input);

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

        for (let i = 0; i < charts.length; i++) {
            await executeGitCommand({
                args: [
                    'add',
                    charts[i].hevi.path,
                ],
                cwd: options.cwd,
            });
        }

        await executeGitCommit({
            cwd: options.cwd,
            message: 'chore: update helm charts',
            userName: options.commitUserName,
            userEmail: options.commitUserEmail,
            author: options.commitAuthor ?
                options.commitAuthor :
                buildDisplayNameEmail(options.commitUserName, options.commitUserEmail),
        });

        if (options.push) {
            await executeGitPush({
                cwd: options.cwd,
                branch: options.branch,
            });
        }
    }

    return charts;
}
