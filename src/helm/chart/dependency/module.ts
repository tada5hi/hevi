/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import type { HelmChartContainer } from '../module';
import type { HelmChartDependency } from '../types';

export class HelmChartDependencyContainer {
    parent : HelmChartContainer;

    data: HelmChartDependency;

    constructor(
        data: HelmChartDependency,
        parent: HelmChartContainer,
    ) {
        this.data = data;
        this.parent = parent;
    }

    get repositoryFilePath(): string | null {
        if (
            !this.data.repository ||
            this.data.repository.substring(0, 7) !== 'file://'
        ) {
            return null;
        }

        const relativePath = this.data.repository.substring(7);

        return path.resolve(this.parent.directoryPath, relativePath);
    }
}
