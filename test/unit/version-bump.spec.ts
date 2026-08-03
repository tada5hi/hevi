/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { bumpVersion } from '../../src';

describe('version-bump', () => {
    it('should bump version (patch)', async () => {
        expect(bumpVersion('1.0.0', 'patch')).toEqual('1.0.1');
    });

    it('should bump version (minor)', async () => {
        expect(bumpVersion('1.0.0', 'minor')).toEqual('1.1.0');
    });

    it('should bump version (major)', async () => {
        expect(bumpVersion('1.0.0', 'major')).toEqual('2.0.0');
    });

    it('should bump patch version when no level is provided', async () => {
        expect(bumpVersion('1.2.3')).toEqual('1.2.4');
    });

    it('should drop the prerelease suffix when no level is provided', async () => {
        expect(bumpVersion('1.2.3-alpha.1')).toEqual('1.2.4');
    });
});
