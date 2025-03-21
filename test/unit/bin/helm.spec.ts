/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import hapic from 'hapic';
import { HelmBinary } from '../../../src';

describe('binary > helm', () => {
    it('should create valid download url for windows', async () => {
        const bin = new HelmBinary({
            platform: 'win32',
            arch: 'x64',
        });

        const response = await hapic.head(bin.downloadURL);
        expect(response.status).toEqual(200);
    });

    it('should create valid download url for linux', async () => {
        const bin = new HelmBinary({
            platform: 'linux',
            arch: 'x64',
        });

        const response = await hapic.head(bin.downloadURL);
        expect(response.status).toEqual(200);
    });
});
