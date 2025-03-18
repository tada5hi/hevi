/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HelmReleaser } from '../../../src';

describe('helm > releaser', () => {
    it('should download helm releaser for windows', async () => {
        const helmReleaser = new HelmReleaser({
            platform: 'win32',
            arch: 'x64',
        });

        const fileName = await helmReleaser.downloadExec();
        expect(fileName).toBeDefined();
    });

    it('should download helm releaser for linux', async () => {
        const helmReleaser = new HelmReleaser({
            platform: 'linux',
            arch: 'x64',
        });

        const fileName = await helmReleaser.downloadExec();
        expect(fileName).toBeDefined();
    });

    it('should execute helm releaser command', async () => {
        const helmReleaser = new HelmReleaser();

        const output = await helmReleaser.execute(['help']);
        expect(output).toBeDefined();
    });
});
