/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HelmChartsVersionOptionsNormalized, HelmChartsVersionizeOptions } from './types';

export function normalizeHelmChartsVersionOptions(
    input: HelmChartsVersionizeOptions = {},
) : HelmChartsVersionOptionsNormalized {
    return {
        dryRun: input.dryRun ?? false,
        version: input.version,
    };
}
