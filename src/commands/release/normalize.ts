/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import process from 'node:process';
import { context } from '@actions/github';
import { Provider } from '../../constants';
import type {
    ReleaseCommandOptions,
    ReleaseCommandOptionsNormalized,
} from './types';

export function normalizeReleaseCmdOptions(input: ReleaseCommandOptions = {}) : ReleaseCommandOptionsNormalized {
    const cwd = input.cwd || process.cwd();
    const directory = input.directory || '.';

    const options : ReleaseCommandOptionsNormalized = {
        owner: input.owner || context.repo.owner,
        repo: input.repo || context.repo.repo,
        upload: input.upload ?? true,
        cwd,
        directory,
        branch: input.branch,
        provider: input.provider,
        token: input.token,
    };

    const { provider } = options;
    if (!provider && (process.env.GITHUB_TOKEN || process.env.GH_TOKEN)) {
        options.provider = Provider.GITHUB;
    }

    if (options.provider === Provider.GITHUB) {
        /**
         * @see https://github.com/actions/toolkit/blob/main/packages/github/src/context.ts
         */
        if (!options.branch) {
            options.branch = process.env.GITHUB_REF || 'gh-pages';
        }

        if (!options.token) {
            options.token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
        }
    }

    return options;
}
