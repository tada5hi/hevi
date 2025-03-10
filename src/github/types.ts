/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { getOctokit } from '@actions/github';

export type GithubClient = ReturnType<typeof getOctokit>;
