/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import { computeGitSha } from '../../src/git';

describe('git', () => {
    it('should compute hash', async () => {
        const content = await fs.promises.readFile('test/data/sha.json', { encoding: 'utf-8' });

        const sha = computeGitSha(content);
        /**
         * https://api.github.com/repos/tada5hi/workspaces-publish/contents/tsconfig.json
         */
        expect(sha).toEqual('0f7372d521d70832c0eb128eba2ea9feec3a2113');
    });
});
