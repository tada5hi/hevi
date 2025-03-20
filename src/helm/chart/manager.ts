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
import { executeShellCommand } from '../../utils/exec';
import { executeGitCommand, executeGitCommit, executeGitPush } from '../../git';

import {
    HelmReleaser,
} from './releaser';
import { buildDisplayNameEmail } from '../../utils';

export class HelmChartManager {
    protected graph : Graph<string>;

    protected items: Record<string, HelmChartContainer>;

    protected releaser : HelmReleaser;

    constructor() {
        this.graph = new Graph();

        this.items = {};

        this.releaser = new HelmReleaser();
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

            if (options.commit) {
                await chart.save();

                await executeGitCommand({
                    args: [
                        'add',
                        this.items[i].directoryPathRelativePosix,
                    ],
                });
            }
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

    async packageCharts() : Promise<HelmChartContainer[]> {
        await executeShellCommand('rm', ['-rf', '.cr-index']);
        await executeShellCommand('rm', ['-rf', '.cr-release-packages']);

        await executeShellCommand('mkdir', ['-p', '.cr-index']);
        await executeShellCommand('mkdir', ['-p', '.cr-release-packages']);

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

    async releaseCharts(input: HelmChartsReleaseOptions) : Promise<HelmChartContainer[]> {
        const options = normalizeHelmChartsReleaseOptions(input);

        const uploadArgs : string[] = [
            '-o',
            options.owner,
            '-r',
            options.repo,
            '--package-path',
            '.cr-release-packages',
        ];

        if (options.token) {
            uploadArgs.push(...['-t', options.token]);
        }
        if (options.branch) {
            uploadArgs.push(...['--pages-branch', options.branch]);
        }

        // release step
        await this.releaser.execute([
            'upload',
            '--skip-existing',
            ...uploadArgs,
        ]);

        // update index step
        await this.releaser.execute([
            'index',
            '--push',
            ...uploadArgs,
        ]);

        return Object.values(this.items);
    }
}
