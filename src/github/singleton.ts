/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Factory } from 'singa';
import { singa } from 'singa';
import type { GithubClient } from './types';

const instance = singa<GithubClient>({
    name: 'githubClient',
});

export function setGithubClientFactory(factory: Factory<GithubClient>) {
    instance.setFactory(factory);
}

export function isGithubClientUsable() {
    return instance.has() || instance.hasFactory();
}

export function useGithubClient() {
    return instance.use();
}
