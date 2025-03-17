/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import process from 'node:process';
import type { HelmChartsManagerOptions, HelmChartsManagerOptionsNormalized } from './types';

export function normalizeHelmChartsManagerOptions(
    input: HelmChartsManagerOptions,
) : HelmChartsManagerOptionsNormalized {
    const cwd = input.cwd || process.cwd();
    const directory = input.directory || '.';

    return {
        cwd,
        directory,
    };
}
