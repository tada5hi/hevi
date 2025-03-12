/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { execute } from '../../../../src';

describe('helm', () => {
    it('should bump version', async () => {
        const charts = await execute({
            commit: false,
            push: false,
            directory: 'test/data',
        });

        expect(charts.length).toBeGreaterThan(0);

        const [chart] = charts;
        expect(chart.version).toEqual('0.1.1');
        expect(chart.appVersion).toEqual('0.1.1');
    });

    it('should set version', async () => {
        const charts = await execute({
            commit: false,
            push: false,
            directory: 'test/data',
            version: '2.0.0',
        });

        expect(charts.length).toBeGreaterThan(0);

        const [chart] = charts;
        expect(chart.version).toEqual('2.0.0');
        expect(chart.appVersion).toEqual('2.0.0');
    });
});
