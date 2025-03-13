/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import process from 'node:process';
import { Provider } from '../../constants';
import type {
    VersionCommandOptions,
    VersionCommandOptionsNormalized,
} from './types';
import { buildDisplayNameEmail, parseDisplayNameEmail } from '../../utils';

export function normalizeVersionCommandOptions(
    input: VersionCommandOptions = {},
) : VersionCommandOptionsNormalized {
    const cwd = input.cwd || process.cwd();
    const directory = input.directory || '.';

    let commitUserName : string | undefined;
    let commitUserEmail : string | undefined;

    if (input.commitUser) {
        const { name, email } = parseDisplayNameEmail(input.commitUser);
        commitUserName = input.commitUserName || name;
        commitUserEmail = input.commitUserEmail || email;
    } else {
        commitUserName = input.commitUserName;
        commitUserEmail = input.commitUserEmail;
    }

    const options : VersionCommandOptionsNormalized = {
        cwd,
        directory,
        branch: input.branch,
        commit: input.commit ?? false,
        commitUserName: commitUserName || 'github-actions[bot]',
        commitUserEmail: commitUserEmail || '41898282+github-actions[bot]@users.noreply.github.com',
        commitAuthor: input.commitAuthor,
        commitAuthorName: input.commitAuthorName,
        commitAuthorEmail: input.commitAuthorEmail,
        push: input.push ?? false,
        provider: input.provider,
        token: input.token,
        version: input.version,
        versionType: input.versionType,
    };

    if (options.commitAuthor) {
        const { name, email } = parseDisplayNameEmail(options.commitAuthor);
        options.commitAuthorName = options.commitAuthorName || name;
        options.commitAuthorEmail = options.commitAuthorEmail || email;
    }

    if (
        !options.commitAuthor &&
        options.commitAuthorName &&
        options.commitAuthorEmail
    ) {
        options.commitAuthor = buildDisplayNameEmail(
            options.commitAuthorName,
            options.commitAuthorEmail,
        );
    }

    const { provider } = options;
    if (!provider && (process.env.GITHUB_TOKEN || process.env.GH_TOKEN)) {
        options.provider = Provider.GITHUB;
    }

    if (options.provider === Provider.GITHUB) {
        /**
         * @see https://github.com/actions/toolkit/blob/main/packages/github/src/context.ts
         */
        if (!options.branch) {
            options.branch = process.env.GITHUB_REF || undefined;
        }

        if (!options.token) {
            options.token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
        }
    }

    return options;
}
