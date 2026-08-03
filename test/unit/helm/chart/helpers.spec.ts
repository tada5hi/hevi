/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import {
    normalizeHelmChartsReleaseOptions,
    normalizeHelmChartsVersionOptions,
} from '../../../../src';

const ENV_KEYS = [
    'GITHUB_TOKEN',
    'GH_TOKEN',
    'GITHUB_REF',
    'GITHUB_REPOSITORY',
] as const;

describe('helm > chart > helpers > version', () => {
    it('should apply defaults', () => {
        expect(normalizeHelmChartsVersionOptions()).toEqual({
            dryRun: false,
            version: undefined,
        });
    });

    it('should keep provided values', () => {
        expect(normalizeHelmChartsVersionOptions({ dryRun: true, version: '1.2.3' })).toEqual({
            dryRun: true,
            version: '1.2.3',
        });
    });
});

describe('helm > chart > helpers > release', () => {
    const env : Record<string, string | undefined> = {};

    beforeEach(() => {
        for (const key of ENV_KEYS) {
            env[key] = process.env[key];
            delete process.env[key];
        }
    });

    afterEach(() => {
        for (const key of ENV_KEYS) {
            const value = env[key];
            if (typeof value === 'undefined') {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
    });

    it('should default the branch to gh-pages', () => {
        expect(normalizeHelmChartsReleaseOptions()).toEqual({
            owner: undefined,
            repo: undefined,
            branch: 'gh-pages',
            token: undefined,
        });
    });

    it('should keep provided values', () => {
        expect(normalizeHelmChartsReleaseOptions({
            owner: 'tada5hi',
            repo: 'hevi',
            branch: 'pages',
            token: 'secret',
        })).toEqual({
            owner: 'tada5hi',
            repo: 'hevi',
            branch: 'pages',
            token: 'secret',
        });
    });

    it('should read the token from the environment', () => {
        process.env.GITHUB_TOKEN = 'from-github-token';
        process.env.GITHUB_REPOSITORY = 'tada5hi/hevi';

        expect(normalizeHelmChartsReleaseOptions()).toEqual({
            owner: 'tada5hi',
            repo: 'hevi',
            branch: 'gh-pages',
            token: 'from-github-token',
        });
    });

    it('should prefer the github token over the gh token', () => {
        process.env.GITHUB_TOKEN = 'from-github-token';
        process.env.GH_TOKEN = 'from-gh-token';
        process.env.GITHUB_REPOSITORY = 'tada5hi/hevi';

        expect(normalizeHelmChartsReleaseOptions().token).toEqual('from-github-token');
    });

    it('should not override an explicit owner and repo', () => {
        process.env.GITHUB_TOKEN = 'from-github-token';
        process.env.GITHUB_REPOSITORY = 'tada5hi/hevi';

        expect(normalizeHelmChartsReleaseOptions({
            owner: 'other',
            repo: 'chart',
        })).toEqual({
            owner: 'other',
            repo: 'chart',
            branch: 'gh-pages',
            token: 'from-github-token',
        });
    });
});
