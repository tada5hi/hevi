/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Graph, topologicalSort } from 'graph-data-structure';
import { buildFilePath, load, locateMany } from 'locter';
import path from 'node:path';
import type { HelmChartsReleaseOptions, HelmChartsVersionizeOptions } from './helpers';
import { HelmChartContainer } from './module';
import {
    normalizeHelmChartsReleaseOptions,
    normalizeHelmChartsVersionOptions,
} from './helpers';
import { executeShellCommand } from '../../utils';

import {
    HelmBinary,
    HelmChartReleaserBinary,
} from '../../bin';
import type { HelmChartManagerPushOptions } from './types';

export class HelmChartManager {
    protected graph : Graph<string>;

    protected items: Record<string, HelmChartContainer>;

    protected helmBinary : HelmBinary;

    protected helmChartReleaserBinary : HelmChartReleaserBinary;

    constructor() {
        this.graph = new Graph();

        this.items = {};

        this.helmBinary = new HelmBinary();
        this.helmChartReleaserBinary = new HelmChartReleaserBinary();
    }

    /**
     * Load a single chart repository from the file system.
     *
     * @param file
     */
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
            if (dependencyRepositoryPath) {
                this.graph.addEdge(container.directoryPath, dependencyRepositoryPath);
            }
        }
    }

    /**
     * Load multiple chart repositories from the file system.
     *
     * @param directory
     */
    async loadMany(directory: string) : Promise<void> {
        this.items = {};
        this.graph = new Graph();

        const locations = await locateMany('**/Chart.{yml,yaml}', {
            ignore: ['node_modules/**'],
            onlyFiles: true,
            path: directory,
        });

        const locationPaths = locations.map((location) => buildFilePath(location));
        const loadPromises = locationPaths.map(
            ((location) => this.load(location)),
        );

        await Promise.all(loadPromises);
    }

    async versionizeCharts(input: HelmChartsVersionizeOptions = {}) {
        const options = normalizeHelmChartsVersionOptions(input);

        const graphFlat = topologicalSort(this.graph)
            .reverse();

        for (let i = 0; i < graphFlat.length; i++) {
            const chart = this.items[graphFlat[i]];

            if (options.version) {
                chart.setVersion(options.version);
            } else {
                chart.bumpVersion();
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

            if (!options.dryRun) {
                await chart.save();
            }
        }

        return Object.values(this.items);
    }

    async packageCharts() : Promise<HelmChartContainer[]> {
        await executeShellCommand('rm', ['-rf', '.helm-index']);
        await executeShellCommand('rm', ['-rf', '.helm-packages']);

        await executeShellCommand('mkdir', ['-p', '.helm-index']);
        await executeShellCommand('mkdir', ['-p', '.helm-packages']);

        const graphFlat = topologicalSort(this.graph)
            .reverse();

        const repositories : Record<string, string> = {};

        for (let i = 0; i < graphFlat.length; i++) {
            const chart = this.items[graphFlat[i]];
            if (!chart) {
                continue;
            }

            for (let j = 0; j < chart.dependencies.length; j++) {
                const { repositoryWebURL } = chart.dependencies[j];
                if (repositoryWebURL) {
                    const webURL = new URL(repositoryWebURL);
                    const webURLKey = `hevi:${webURL.hostname}${webURL.pathname.replaceAll('/', '.')}`;

                    if (!repositories[webURLKey]) {
                        repositories[webURLKey] = repositoryWebURL;

                        await this.helmBinary.execute([
                            'repo',
                            'add',
                            webURLKey,
                            repositoryWebURL,
                        ]);
                    }
                }
            }

            await this.helmChartReleaserBinary.execute([
                'package',
                chart.directoryPathRelativePosix,
                '--package-path',
                '.helm-packages',
            ]);
        }

        const repositoryKeys = Object.keys(repositories);
        for (let i = 0; i < repositoryKeys.length; i++) {
            await this.helmBinary.execute([
                'repo',
                'remove',
                repositoryKeys[i],
            ]);
        }

        return Object.values(this.items);
    }

    async releaseCharts(input: HelmChartsReleaseOptions) : Promise<HelmChartContainer[]> {
        const options = normalizeHelmChartsReleaseOptions(input);

        const uploadArgs : string[] = [
            '--package-path',
            '.helm-packages',
        ];

        if (options.owner && options.repo) {
            uploadArgs.push(
                '-o',
                options.owner,
                '-r',
                options.repo,
            );
        }

        if (options.token) {
            uploadArgs.push('-t', options.token);
        }
        if (options.branch) {
            uploadArgs.push('--pages-branch', options.branch);
        }

        // release step
        await this.helmChartReleaserBinary.execute([
            'upload',
            '--skip-existing',
            ...uploadArgs,
        ]);

        // update index step
        await this.helmChartReleaserBinary.execute([
            'index',
            '--push',
            '--index-path',
            '.helm-index/index.yaml',
            ...uploadArgs,
        ]);

        return Object.values(this.items);
    }

    async pushCharts(options: HelmChartManagerPushOptions) {
        try {
            await this.helmBinary.execute(['registry', 'logout', options.host]);
        } catch (e) {
            // do nothing
        }

        await this.helmBinary.execute([
            'registry',
            'login',
            options.host,
            '--username',
            options.username,
            '--password',
            options.password,
        ]);

        const graphFlat = topologicalSort(this.graph)
            .reverse();

        for (let i = 0; i < graphFlat.length; i++) {
            const chart = this.items[graphFlat[i]];
            if (chart) {
                await this.helmBinary.execute([
                    'push',
                    `.helm-packages/${chart.data.name}-${chart.data.version}`,
                    `oci://${options.host}`,
                ]);
            }
        }

        await this.helmBinary.execute(['registry', 'logout', options.host]);

        return Object.values(this.items);
    }
}
