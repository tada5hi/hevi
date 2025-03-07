/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export const HELM_CHART_META = Symbol.for('HEVI_HELM_CHART_META');

export enum HelmVersionType {
    APP = 'app',
    DEFAULT = 'default',
}

export enum VersionStrategy {
    SET = 'set',
    BUMP = 'bump',
}

export enum SemverLevel {
    MAJOR = 'major',
    MINOR = 'minor',
    PATCH = 'patch',
}
