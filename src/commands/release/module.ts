/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { executeCommand } from '../../utils/exec';
import { findHelmCharts } from '../../helm';
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

    const which = await executeCommand({ cmd: 'which', args: ['cr'] });
    if (!which.startsWith('/')) {
        throw new Error('chart releaser (cr) is not installed.');
    }

    await executeCommand({
        cmd: 'rm',
        args: [
            '-rf',
            '.cr-index',
        ],
    });

    await executeCommand({
        cmd: 'rm',
        args: [
            '-rf',
            '.cr-release-packages',
        ],
    });

    // packaging step
    for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];

        await executeCommand({
            cmd: 'cr',
            args: [
                'package',
                chart.hevi.path,
                '--package-path',
                '.cr-release-packages',
            ],
            cwd: options.cwd,
        });
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
        await executeCommand({
            cmd: 'cr',
            args: [
                'upload',
                '-o',
                options.owner,
                '-r',
                options.repo,
                ...uploadArgs,
            ],
        });

        // update index step
        await executeCommand({
            cmd: 'cr',
            args: [
                'index',
                '-o',
                options.owner,
                '-r',
                options.repo,
                '--push',
                ...uploadArgs,
            ],
        });
    }

    return charts;
}
