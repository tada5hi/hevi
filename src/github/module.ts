/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { context, getOctokit } from '@actions/github';
import { computeGitSha } from '../git';
import type { GithubClient } from './types';

type GithubFileContentOptions = {
    /**
     * relative path e.g. charts/.../Chart.yaml
     */
    path: string,
    /**
     * utf-8 encoded string
     */
    content: string,
    /**
     * commit message
     */
    message: string,
    /**
     * branch
     */
    branch?: string,
};

export class Github {
    public readonly client: GithubClient;

    constructor(token: string) {
        this.client = getOctokit(token);
    }

    async changeFileContent(options: GithubFileContentOptions) {
        const contentBase64 = btoa(options.content);

        await this.client.rest.repos.createOrUpdateFileContents({
            owner: context.repo.owner,
            repo: context.repo.repo,
            path: options.path,
            message: options.message,
            content: contentBase64,
            sha: computeGitSha(contentBase64),
            branch: options.branch,
        });
    }
}
