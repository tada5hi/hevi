/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HelmChartManager } from '../../../../src';

describe('helm', () => {
    let manager : HelmChartManager;

    beforeAll(async () => {
        manager = new HelmChartManager();
        await manager.loadMany('test/data');
    });

    it('should bump version', async () => {
        const charts = await manager.versionizeCharts({
            dryRun: true,
        });

        expect(charts.length).toEqual(2);

        const foo = charts.find(
            (chart) => chart.data.name === 'foo',
        );

        expect(foo).toBeDefined();
        expect(foo?.data.version).toEqual('0.1.1');

        expect(foo?.data?.dependencies).toBeDefined();
        expect(foo?.data?.dependencies?.[0].name).toEqual('bar');
        expect(foo?.data?.dependencies?.[0].version).toEqual('0.1.1');

        const bar = charts.find(
            (chart) => chart.data.name === 'bar',
        );

        expect(bar).toBeDefined();
        expect(bar?.data.version).toEqual('0.1.1');
        expect(bar?.data.appVersion).toEqual('1.16.0');
    });

    it('should set version', async () => {
        const charts = await manager.versionizeCharts({
            version: '2.0.0',
            dryRun: true,
        });

        const foo = charts.find(
            (chart) => chart.data.name === 'foo',
        );

        expect(foo).toBeDefined();
        expect(foo?.data.version).toEqual('2.0.0');

        expect(foo?.data?.dependencies).toBeDefined();
        expect(foo?.data?.dependencies?.[0].name).toEqual('bar');
        expect(foo?.data?.dependencies?.[0].version).toEqual('2.0.0');

        const bar = charts.find(
            (chart) => chart.data.name === 'bar',
        );

        expect(bar).toBeDefined();
        expect(bar?.data.version).toEqual('2.0.0');
        expect(bar?.data.appVersion).toEqual('1.16.0');
    });
});
