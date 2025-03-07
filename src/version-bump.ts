/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ReleaseType } from 'semver';
import {
    inc, major, minor, patch,
} from 'semver';

export function bumpVersion(version: string, level?: ReleaseType) {
    if (level) {
        return inc(version, level);
    }

    // todo: respect prerelease
    return `${major(version)}.${minor(version)}.${patch(version) + 1}`;
}
