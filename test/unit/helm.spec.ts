/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { findHelmCharts, setHelmChartsVersion } from '../../src';

describe('helm', () => {
    it('should read, bump & write helm charts', async () => {
        const charts = await findHelmCharts({
            cwd: 'test/data',
        });

        setHelmChartsVersion(charts, '1.0.0');

        expect(charts.length).toBeGreaterThan(0);

        const [chart] = charts;
        expect(chart.version).toEqual('1.0.0');
        expect(chart.appVersion).toEqual('1.0.0');
    });
});
