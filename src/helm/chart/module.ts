/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import path from 'node:path';
import { stringify } from 'yaml';
import { bumpVersion } from '../../version-bump';
import { HelmChartDependencyContainer } from './dependency';
import type {
    HelmChart,
    IHelmChartContainer,
    IHelmChartDependencyContainer,
} from './types';

type HelmChartContainerOptions = {
    path?: string
};

export class HelmChartContainer implements IHelmChartContainer {
    data: HelmChart;

    dependencies : IHelmChartDependencyContainer[];

    path : string;

    // -----------------------------------------------------------------

    constructor(
        data: HelmChart,
        options: HelmChartContainerOptions = {},
    ) {
        this.data = data;
        this.path = options.path ?
            options.path :
            path.join(process.cwd(), 'Chart.yml');

        this.dependencies = [];

        if (data.dependencies) {
            for (const dependency of data.dependencies) {
                const dependencyContainer = new HelmChartDependencyContainer(dependency, this);
                this.dependencies.push(dependencyContainer);
            }
        }
    }

    // -----------------------------------------------------------------

    async save() {
        await fs.promises.writeFile(this.path, this.serialize());
    }

    // -----------------------------------------------------------------

    setVersion(version: string) {
        this.data.version = version;
    }

    bumpVersion() {
        if (this.data.version) {
            this.data.version = bumpVersion(this.data.version) || this.data.version;
        }
    }

    // -----------------------------------------------------------------

    serialize() : string {
        return stringify(this.data);
    }

    // -----------------------------------------------------------------

    get pathRelative() {
        return path.relative(process.cwd(), this.path);
    }

    get pathRelativePosix() {
        return this.pathRelative.replaceAll(path.win32.sep, path.posix.sep);
    }

    get directoryPath() {
        return path.dirname(this.path);
    }

    get directoryPathRelative() {
        return path.relative(process.cwd(), this.directoryPath);
    }

    get directoryPathRelativePosix() {
        return this.directoryPathRelative.replaceAll(path.win32.sep, path.posix.sep);
    }
}
