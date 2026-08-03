/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import hapic from 'hapic';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HelmBinary } from '../../../src';

describe('binary > helm', () => {
    it('should build download url for windows', () => {
        const bin = new HelmBinary({
            version: '4.2.3',
            platform: 'win32',
            arch: 'x64',
        });

        expect(bin.downloadURL).toEqual('https://get.helm.sh/helm-v4.2.3-windows-amd64.zip');
    });

    it('should build download url for linux', () => {
        const bin = new HelmBinary({
            version: '4.2.3',
            platform: 'linux',
            arch: 'arm64',
        });

        expect(bin.downloadURL).toEqual('https://get.helm.sh/helm-v4.2.3-linux-arm64.tar.gz');
    });

    it('should build executable name depending on platform', () => {
        expect(new HelmBinary({ platform: 'win32' }).name).toEqual('helm.exe');
        expect(new HelmBinary({ platform: 'linux' }).name).toEqual('helm');
    });

    it('should build path inside the binary directory', () => {
        const bin = new HelmBinary({
            version: '4.2.3',
            platform: 'linux',
            arch: 'x64',
        });

        expect(bin.directory).toEqual(path.join(
            process.env.RUNNER_TOOL_CACHE || os.tmpdir(),
            'hevi-helm',
            '4.2.3',
            'linux',
            'x64',
        ));
        expect(bin.path).toEqual(path.join(bin.directory, 'helm'));
    });

    it('should reject platforms without a remote source', async () => {
        const bin = new HelmBinary({ platform: 'aix' });

        await expect(bin.download()).rejects.toThrow('Platform aix has no remote source.');
    });

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
