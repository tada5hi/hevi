/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */
import type { HelmVersionType } from '../../../../constants';

export type HelmChartsVersionOptions = {
    /**
     * git token
     */
    token?: string,

    /**
     * default: github
     */
    provider?: string,

    /**
     * Git branch.
     */
    branch?: string,

    /**
     * default: false
     */
    commit?: boolean,
    /**
     * format: Display Name <email@address.com>'
     */
    commitUser?: string,
    /**
     * default: github-actions[bot]
     */
    commitUserName?: string,

    /**
     * default: 41898282+github-actions[bot]@users.noreply.github.com
     */
    commitUserEmail?: string,
    /**
     * see @property commitUser
     */
    commitAuthor?: string,
    /**
     * see @property commitUserName
     */
    commitAuthorName?: string,
    /**
     * see @property commitUserEmail
     */
    commitAuthorEmail?: string,

    /**
     * default: false
     */
    push?: boolean,

    /**
     * if not defined, patched version.
     */
    version?: string

    /**
     * default: undefined
     */
    versionType?: `${HelmVersionType}` | string,
};

export type HelmChartsVersionOptionsNormalized = {
    /**
     * git token
     */
    token?: string,

    /**
     * default: github
     */
    provider?: string,

    /**
     * Git branch.
     */
    branch?: string,

    /**
     * default: true
     */
    commit: boolean,

    /**
     * default: github-actions[bot]
     */
    commitUserName: string,

    /**
     * default: 41898282+github-actions[bot]@users.noreply.github.com
     */
    commitUserEmail: string,

    /**
     * see @property commitUser
     */
    commitAuthor?: string,

    /**
     * see @property commitUserName
     */
    commitAuthorName?: string,

    /**
     * see @property commitUserEmail
     */
    commitAuthorEmail?: string,

    /**
     * default: true
     */
    push: boolean,

    /**
     * if not defined, patched version.
     */
    version?: string

    /**
     * default: undefined
     */
    versionType?: `${HelmVersionType}` | string,
};
