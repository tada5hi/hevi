/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import process from 'node:process';
import { context } from '@actions/github';
import type {
    HelmChartsPushOptions,
    HelmChartsPushOptionsNormalized,
} from './types';

export function normalizeHelmChartsPushOptions(input: HelmChartsPushOptions = {}) : HelmChartsPushOptionsNormalized {
    const options : HelmChartsPushOptionsNormalized = {
        owner: input.owner || context.repo.owner,
        repo: input.repo || context.repo.repo,
        branch: input.branch,
        token: input.token,
    };

    /**
         * @see https://github.com/actions/toolkit/blob/main/packages/github/src/context.ts
         */
    if (!options.branch) {
        options.branch = process.env.GITHUB_REF || 'gh-pages';
    }

    if (!options.token) {
        options.token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
    }

    return options;
}
