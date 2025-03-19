/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Graph, topologicalSort } from 'graph-data-structure';
import { buildFilePath, load, locateMany } from 'locter';
import path from 'node:path';
import type { HelmChartsPushOptions, HelmChartsVersionOptions } from './helpers';
import { HelmChartContainer } from './module';
import {
    normalizeHelmChartsPushOptions,
    normalizeHelmChartsVersionOptions,
} from './helpers';
import { executeShellCommand } from '../../utils/exec';
import { executeGitCommand, executeGitCommit, executeGitPush } from '../../git';

import {
    HelmReleaser,
} from './releaser';
import { buildDisplayNameEmail } from '../../utils';

export class HelmChartManager {
    protected graph : Graph<string>;

    protected items: Record<string, HelmChartContainer>;

    protected loaded: Set<string>;

    protected releaser : HelmReleaser;

    constructor() {
        this.graph = new Graph();

        this.items = {};
        this.loaded = new Set<string>();

        this.releaser = new HelmReleaser();
    }

    async load(file: string) {
        let filePath = path.isAbsolute(file) ?
            file :
            path.join(process.cwd(), file);

        if (
            !filePath.endsWith('Chart.yml') &&
            !filePath.endsWith('Chart.yaml')
        ) {
            filePath = path.join(process.cwd(), filePath);
        }

        const data = await load(filePath);
        const container = new HelmChartContainer(data, {
            path: filePath,
        });

        this.items[container.directoryPath] = container;

        this.graph.removeNode(container.directoryPath);
        this.graph.addNode(container.directoryPath);

        for (let i = 0; i < container.dependencies.length; i++) {
            const dependencyRepositoryPath = container.dependencies[i].repositoryFilePath;
            if (!dependencyRepositoryPath) {
                continue;
            }

            this.graph.addEdge(container.directoryPath, dependencyRepositoryPath);
        }
    }

    async loadMany(directory: string) : Promise<void> {
        this.items = {};
        this.graph = new Graph();

        const locations = await locateMany('**/Chart.{yml,yaml}', {
            ignore: ['node_modules/**'],
            onlyFiles: true,
            path: directory,
        });

        const loadPromises = locations.map(
            ((location) => this.load(buildFilePath(location))),
        );

        await Promise.all(loadPromises);
    }

    async versionCharts(input: HelmChartsVersionOptions = {}) {
        const options = normalizeHelmChartsVersionOptions(input);

        const graphFlat = topologicalSort(this.graph)
            .reverse();

        for (let i = 0; i < graphFlat.length; i++) {
            const chart = this.items[graphFlat[i]];

            if (options.version) {
                chart.setVersion(options.version, options.versionType);
            } else {
                chart.bumpVersion(options.versionType);
            }

            const adjacentPaths = this.graph.adjacent(graphFlat[i]);
            if (adjacentPaths) {
                adjacentPaths.forEach((adjacentPath) => {
                    const adjacentChart = this.items[adjacentPath];
                    if (adjacentChart) {
                        for (let j = 0; j < chart.dependencies.length; j++) {
                            if (chart.dependencies[j].repositoryFilePath === adjacentChart.directoryPath) {
                                chart.dependencies[j].data.version = adjacentChart.data.version;
                            }
                        }
                    }
                });
            }

            if (!options.commit) {
                continue;
            }

            await chart.save();

            await executeGitCommand({
                args: [
                    'add',
                    this.items[i].directoryPathRelativePosix,
                ],
            });
        }

        if (options.commit) {
            await executeGitCommit({
                message: 'chore: update helm charts',
                userName: options.commitUserName,
                userEmail: options.commitUserEmail,
                author: options.commitAuthor ?
                    options.commitAuthor :
                    buildDisplayNameEmail(options.commitUserName, options.commitUserEmail),
            });

            if (options.push) {
                await executeGitPush({
                    branch: options.branch,
                });
            }
        }

        return Object.values(this.items);
    }

    async buildCharts() : Promise<HelmChartContainer[]> {
        await executeShellCommand(
            'rm',
            [
                '-rf',
                '.cr-index',
            ],
        );

        await executeShellCommand(
            'rm',
            [
                '-rf',
                '.cr-release-packages',
            ],
        );

        const graphFlat = topologicalSort(this.graph)
            .reverse();

        for (let i = 0; i < graphFlat.length; i++) {
            const chart = this.items[graphFlat[i]];

            await this.releaser.execute([
                'package',
                chart.directoryPathRelativePosix,
                '--package-path',
                '.cr-release-packages',
            ]);
        }

        return Object.values(this.items);
    }

    async pushCharts(input: HelmChartsPushOptions) : Promise<HelmChartContainer[]> {
        const options = normalizeHelmChartsPushOptions(input);

        const uploadArgs : string[] = [];
        if (options.token) {
            uploadArgs.push(...['-t', options.token]);
        }
        if (options.branch) {
            uploadArgs.push(...['--pages-branch', options.branch]);
        }

        // release step
        await this.releaser.execute([
            'upload',
            '-o',
            options.owner,
            '-r',
            options.repo,
            ...uploadArgs,
        ]);

        // update index step
        await this.releaser.execute([
            'index',
            '-o',
            options.owner,
            '-r',
            options.repo,
            '--push',
            ...uploadArgs,
        ]);

        return Object.values(this.items);
    }
}
