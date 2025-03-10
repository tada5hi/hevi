/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { context } from '@actions/github';
import { computeGitSha } from '../git';
import { useGithubClient } from './singleton';

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
    message: string
};

export function changeGithubFileContent(options: GithubFileContentOptions) {
    const octokit = useGithubClient();

    octokit.rest.repos.createOrUpdateFileContents({
        owner: context.repo.owner,
        repo: context.repo.repo,
        path: options.path,
        message: options.message,
        content: btoa(options.content),
        sha: computeGitSha(options.content),
    });
}
