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
import { HelmChartReleaserBinary } from '../../../src';

describe('binary > helm-chart-releaser', () => {
    it('should build download url for windows', () => {
        const bin = new HelmChartReleaserBinary({
            version: '1.8.1',
            platform: 'win32',
            arch: 'x64',
        });

        expect(bin.downloadURL).toEqual(
            'https://github.com/helm/chart-releaser/releases/download/v1.8.1/chart-releaser_1.8.1_windows_amd64.zip',
        );
    });

    it('should build download url for linux', () => {
        const bin = new HelmChartReleaserBinary({
            version: '1.8.1',
            platform: 'linux',
            arch: 'arm64',
        });

        expect(bin.downloadURL).toEqual(
            'https://github.com/helm/chart-releaser/releases/download/v1.8.1/chart-releaser_1.8.1_linux_arm64.tar.gz',
        );
    });

    it('should build executable name depending on platform', () => {
        expect(new HelmChartReleaserBinary({ platform: 'win32' }).name).toEqual('cr.exe');
        expect(new HelmChartReleaserBinary({ platform: 'linux' }).name).toEqual('cr');
    });

    it('should build path inside the binary directory', () => {
        const bin = new HelmChartReleaserBinary({
            version: '1.8.1',
            platform: 'linux',
            arch: 'x64',
        });

        expect(bin.directory).toEqual(path.join(
            process.env.RUNNER_TOOL_CACHE || os.tmpdir(),
            'hevi-helm-chart-releaser',
            '1.8.1',
            'linux',
            'x64',
        ));
        expect(bin.path).toEqual(path.join(bin.directory, 'cr'));
    });

    it('should reject platforms without a remote source', async () => {
        const bin = new HelmChartReleaserBinary({ platform: 'aix' });

        await expect(bin.download()).rejects.toThrow('Platform aix has no remote source.');
    });

    it('should create valid download url for windows', async () => {
        const bin = new HelmChartReleaserBinary({
            platform: 'win32',
            arch: 'x64',
        });

        const response = await hapic.head(bin.downloadURL);
        expect(response.status).toEqual(200);
    });

    it('should create valid download url for linux', async () => {
        const bin = new HelmChartReleaserBinary({
            platform: 'linux',
            arch: 'x64',
        });

        const response = await hapic.head(bin.downloadURL);
        expect(response.status).toEqual(200);
    });
});
