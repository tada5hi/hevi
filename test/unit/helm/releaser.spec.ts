/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HelmReleaser } from '../../../src';

describe('helm > releaser', () => {
    it('should download helm releaser', async () => {
        const helmReleaser = new HelmReleaser();

        const fileName = await helmReleaser.download();

        expect(fileName).toBeDefined();
    });

    it('should execute helm releaser command', async () => {
        const helmReleaser = new HelmReleaser();

        const output = await helmReleaser.execute(['help']);
        expect(output).toBeDefined();
    });
});
