/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HelmVersionType } from '../constants';
import type { HelmChart } from './types';
import { bumpVersion } from '../version-bump';

export function setHelmChartVersion(chart: HelmChart, version: string, type?: `${HelmVersionType}` | string) {
    if (type === HelmVersionType.APP) {
        chart.appVersion = version;
        return chart;
    }

    if (type === HelmVersionType.DEFAULT) {
        chart.version = version;
        return chart;
    }

    setHelmChartVersion(chart, version, HelmVersionType.APP);
    setHelmChartVersion(chart, version, HelmVersionType.DEFAULT);

    return chart;
}

export function bumpHelmChartVersion(chart: HelmChart, type?: `${HelmVersionType}` | string) {
    if (type === HelmVersionType.APP) {
        if (chart.appVersion) {
            chart.appVersion = bumpVersion(chart.appVersion) || '1.0.0';
        } else {
            chart.appVersion = '1.0.0';
        }

        return chart;
    }

    if (type === HelmVersionType.DEFAULT) {
        if (chart.version) {
            chart.version = bumpVersion(chart.version) || '1.0.0';
        } else {
            chart.version = '1.0.0';
        }
        return chart;
    }

    bumpHelmChartVersion(chart, HelmVersionType.APP);
    bumpHelmChartVersion(chart, HelmVersionType.DEFAULT);

    return chart;
}
