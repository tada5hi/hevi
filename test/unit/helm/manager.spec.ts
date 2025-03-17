/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HelmChartsManager} from '../../../src';

describe('helm', () => {
    it('should bump version', async () => {
        const manager = new HelmChartsManager({
            directory: 'test/data',
        });
        const charts = await manager.versionCharts({
            commit: false,
            push: false,
        });

        expect(charts.length).toBeGreaterThan(0);

        const [chart] = charts;
        expect(chart.version).toEqual('0.1.1');
        expect(chart.appVersion).toEqual('0.1.1');
    });

    it('should set version', async () => {
        const manager = new HelmChartsManager({
            directory: 'test/data',
        });
        const charts = await manager.versionCharts({
            commit: false,
            push: false,
            version: '2.0.0',
        });

        expect(charts.length).toBeGreaterThan(0);

        const [chart] = charts;
        expect(chart.version).toEqual('2.0.0');
        expect(chart.appVersion).toEqual('2.0.0');
    });
});
