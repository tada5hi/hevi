/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HelmVersionType } from '../constants';
import type { HelmChart } from './types';

export function setHelmChartVersion(chart: HelmChart, version: string, type?: `${HelmVersionType}`) {
    if (type === 'app') {
        chart.appVersion = version;
        return chart;
    }

    if (type === 'default') {
        chart.version = version;
        return chart;
    }

    setHelmChartVersion(chart, version, HelmVersionType.APP);
    setHelmChartVersion(chart, version, HelmVersionType.DEFAULT);

    return chart;
}

export function setHelmChartsVersion(charts: HelmChart[], version: string, type?: `${HelmVersionType}`) {
    return charts.map((chart) => setHelmChartVersion(chart, version, type));
}
