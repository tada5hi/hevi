/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import type { HelmChart } from './types';
import { serializeHelmChart } from './serialize';

export async function writeHelmChart(container: HelmChart) : Promise<void> {
    await fs.promises.writeFile(container.meta.path, serializeHelmChart(container));
}

export async function writeHelmCharts(containers: HelmChart[]) : Promise<void> {
    const promises = containers.map((container) => writeHelmChart(container));

    await Promise.all(promises);
}
