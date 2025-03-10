/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { stringify } from 'yaml';
import type { HelmChart } from './types';

export function serializeHelmChart(container: HelmChart) {
    const { hevi, ...data } = container;

    return stringify(data);
}
