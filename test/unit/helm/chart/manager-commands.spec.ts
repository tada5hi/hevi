/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { HelmChartManager } from '../../../../src';
import { FakeBinary } from '../../../utils/binary';

const FIXTURE_DIRECTORY = path.join(process.cwd(), 'test', 'data', 'charts');

describe('helm > chart > manager > commands', () => {
    let cwd : string;
    let directory : string;
    let helmBinary : FakeBinary;
    let helmChartReleaserBinary : FakeBinary;
    let manager : HelmChartManager;

    beforeEach(async () => {
        cwd = process.cwd();

        directory = await fs.promises.realpath(
            await fs.promises.mkdtemp(path.join(os.tmpdir(), 'hevi-test-')),
        );
        await fs.promises.cp(FIXTURE_DIRECTORY, directory, { recursive: true });

        helmBinary = new FakeBinary('helm');
        helmChartReleaserBinary = new FakeBinary('cr');

        manager = new HelmChartManager({ helmBinary, helmChartReleaserBinary });
        await manager.loadMany(directory);

        // the output directories are resolved relative to the current working directory
        process.chdir(directory);
    });

    afterEach(async () => {
        process.chdir(cwd);

        await fs.promises.rm(directory, { recursive: true, force: true });
    });

    it('should package charts in dependency order', async () => {
        const charts = await manager.packageCharts();

        expect(charts.length).toEqual(2);

        // bar has no dependencies and therefore has to be packaged before foo
        const packaged = helmBinary.calls
            .filter((args) => args[0] === 'package')
            .map((args) => args[1]);

        expect(packaged).toEqual(['bar', 'foo']);

        const destinations = helmBinary.calls
            .filter((args) => args[0] === 'package')
            .map((args) => [args[2], args[3]]);

        expect(destinations).toEqual([
            ['--destination', '.hevi/packages'],
            ['--destination', '.hevi/packages'],
        ]);

        const updated = helmBinary.calls
            .filter((args) => args[0] === 'dependency')
            .map((args) => [args[1], args[2]]);

        expect(updated).toEqual([
            ['update', 'bar'],
            ['update', 'foo'],
        ]);

        // the fixtures only reference file:// dependencies, no repository is registered
        expect(helmBinary.calls.filter((args) => args[0] === 'repo')).toEqual([]);

        await expect(fs.promises.access(path.join(directory, '.hevi', 'packages'))).resolves.toBeUndefined();
        await expect(fs.promises.access(path.join(directory, '.hevi', 'index'))).resolves.toBeUndefined();
    });

    it('should register and remove web repositories of dependencies', async () => {
        const chartPath = path.join(directory, 'baz', 'Chart.yaml');
        await fs.promises.mkdir(path.dirname(chartPath), { recursive: true });
        await fs.promises.writeFile(chartPath, [
            'apiVersion: v2',
            'name: baz',
            'description: A Helm chart for Kubernetes',
            'type: application',
            'version: 0.1.0',
            'appVersion: "1.16.0"',
            'dependencies:',
            '    -   name: external',
            '        version: 1.0.0',
            '        repository: https://charts.example.com/stable',
        ].join('\n'));

        const scoped = new HelmChartManager({ helmBinary, helmChartReleaserBinary });
        await scoped.load(chartPath);

        await scoped.packageCharts();

        expect(helmBinary.calls).toContainEqual([
            'repo',
            'add',
            'hevi:charts.example.com.stable',
            'https://charts.example.com/stable',
        ]);

        expect(helmBinary.calls).toContainEqual([
            'repo',
            'remove',
            'hevi:charts.example.com.stable',
        ]);
    });

    it('should release charts via chart-releaser', async () => {
        await manager.releaseCharts({
            owner: 'tada5hi',
            repo: 'hevi',
            branch: 'gh-pages',
            token: 'secret',
        });

        expect(helmChartReleaserBinary.calls[0]).toEqual([
            'upload',
            '--skip-existing',
            '--package-path',
            '.hevi/packages',
            '-o',
            'tada5hi',
            '-r',
            'hevi',
            '-t',
            'secret',
            '--pages-branch',
            'gh-pages',
        ]);

        expect(helmChartReleaserBinary.calls[1]).toEqual([
            'index',
            '--push',
            '--index-path',
            '.hevi/index/index.yaml',
            '--package-path',
            '.hevi/packages',
            '-o',
            'tada5hi',
            '-r',
            'hevi',
            '-t',
            'secret',
            '--pages-branch',
            'gh-pages',
        ]);
    });

    it('should push charts to an oci registry', async () => {
        await manager.pushCharts({
            host: 'ghcr.io',
            username: 'user',
            password: 'pass',
        });

        expect(helmBinary.calls[0]).toEqual(['registry', 'logout', 'ghcr.io']);
        expect(helmBinary.calls[1]).toEqual([
            'registry',
            'login',
            'ghcr.io',
            '--username',
            'user',
            '--password',
            'pass',
        ]);

        const pushed = helmBinary.calls
            .filter((args) => args[0] === 'push')
            .map((args) => [args[1], args[2]]);

        expect(pushed).toEqual([
            ['.hevi/packages/bar-0.1.0.tgz', 'oci://ghcr.io'],
            ['.hevi/packages/foo-0.1.0.tgz', 'oci://ghcr.io'],
        ]);

        expect(helmBinary.calls[helmBinary.calls.length - 1]).toEqual(['registry', 'logout', 'ghcr.io']);
    });
});
