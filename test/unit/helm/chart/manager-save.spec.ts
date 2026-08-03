/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parse } from 'yaml';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import type { HelmChart } from '../../../../src';
import { HelmChartManager } from '../../../../src';

const FIXTURE_DIRECTORY = path.join(process.cwd(), 'test', 'data', 'charts');

async function readChart(filePath: string) : Promise<HelmChart> {
    return parse(await fs.promises.readFile(filePath, { encoding: 'utf8' }));
}

describe('helm > chart > manager > save', () => {
    let directory : string;

    beforeEach(async () => {
        directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'hevi-test-'));

        await fs.promises.cp(FIXTURE_DIRECTORY, directory, { recursive: true });
    });

    afterEach(async () => {
        await fs.promises.rm(directory, { recursive: true, force: true });
    });

    it('should write bumped versions to the file system', async () => {
        const manager = new HelmChartManager();
        await manager.loadMany(directory);

        const charts = await manager.versionizeCharts();
        expect(charts.length).toEqual(2);

        const foo = await readChart(path.join(directory, 'foo', 'Chart.yaml'));
        const bar = await readChart(path.join(directory, 'bar', 'Chart.yaml'));

        expect(foo.version).toEqual('0.1.1');
        expect(bar.version).toEqual('0.1.1');

        // the file dependency of foo must be lifted to the new version of bar
        expect(foo.dependencies?.[0]?.name).toEqual('bar');
        expect(foo.dependencies?.[0]?.version).toEqual('0.1.1');
    });

    it('should write an explicit version to the file system', async () => {
        const manager = new HelmChartManager();
        await manager.loadMany(directory);

        await manager.versionizeCharts({ version: '9.8.7' });

        const foo = await readChart(path.join(directory, 'foo', 'Chart.yaml'));
        const bar = await readChart(path.join(directory, 'bar', 'Chart.yaml'));

        expect(foo.version).toEqual('9.8.7');
        expect(bar.version).toEqual('9.8.7');
        expect(foo.dependencies?.[0]?.version).toEqual('9.8.7');
    });

    it('should load a single chart', async () => {
        const manager = new HelmChartManager();
        await manager.load(path.join(directory, 'bar', 'Chart.yaml'));

        const charts = await manager.versionizeCharts({ dryRun: true });

        expect(charts.length).toEqual(1);
        expect(charts[0]?.data.name).toEqual('bar');
        expect(charts[0]?.data.version).toEqual('0.1.1');
    });

    it('should not load the same chart twice', async () => {
        const manager = new HelmChartManager();
        const filePath = path.join(directory, 'bar', 'Chart.yaml');

        await manager.load(filePath);
        await manager.load(filePath);

        const charts = await manager.versionizeCharts({ dryRun: true });

        expect(charts.length).toEqual(1);
    });
});
