/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { executeShellCommand } from '../../utils/exec';
import { HelmReleaser, findHelmCharts } from '../../helm';
import type { ReleaseCommandOptionsNormalized } from './types';
import { normalizeReleaseCmdOptions } from './normalize';

export async function executeReleaseCmd(
    input: ReleaseCommandOptionsNormalized,
) {
    const options = normalizeReleaseCmdOptions(input);
    const directoryPath = path.join(options.cwd, options.directory);

    const charts = await findHelmCharts({
        cwd: directoryPath,
    });

    await executeShellCommand({
        cmd: 'rm',
        args: [
            '-rf',
            '.cr-index',
        ],
    });

    await executeShellCommand({
        cmd: 'rm',
        args: [
            '-rf',
            '.cr-release-packages',
        ],
    });

    const helmReleaser = new HelmReleaser({
        cwd: options.cwd,
    });

    // packaging step
    for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];

        await helmReleaser.execute([
            'package',
            chart.hevi.path,
            '--package-path',
            '.cr-release-packages',
        ]);
    }

    if (options.upload) {
        const uploadArgs : string[] = [];
        if (options.token) {
            uploadArgs.push(...['-t', options.token]);
        }
        if (options.branch) {
            uploadArgs.push(...['--pages-branch', options.branch]);
        }

        // release step
        await helmReleaser.execute([
            'upload',
            '-o',
            options.owner,
            '-r',
            options.repo,
            ...uploadArgs,
        ]);

        // update index step
        await helmReleaser.execute([
            'index',
            '-o',
            options.owner,
            '-r',
            options.repo,
            '--push',
            ...uploadArgs,
        ]);
    }

    return charts;
}
