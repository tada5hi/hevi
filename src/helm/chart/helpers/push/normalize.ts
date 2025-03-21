/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import process from 'node:process';
import { context } from '@actions/github';
import type {
    HelmChartsReleaseOptions,
    HelmChartsReleaseOptionsNormalized,
} from './types';

export function normalizeHelmChartsReleaseOptions(input: HelmChartsReleaseOptions = {}) : HelmChartsReleaseOptionsNormalized {
    const options : HelmChartsReleaseOptionsNormalized = {
        owner: input.owner,
        repo: input.repo,
        branch: input.branch,
        token: input.token,
    };

    /**
         * @see https://github.com/actions/toolkit/blob/main/packages/github/src/context.ts
         */
    if (!options.branch) {
        options.branch = 'gh-pages';
    }

    if (!options.token) {
        options.token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
    }

    if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_REF) {
        if (!options.owner || !options.repo) {
            options.owner = context.repo.owner;
            options.repo = context.repo.repo;
        }
    }

    return options;
}
