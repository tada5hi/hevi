/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Graph, topologicalSort } from 'graph-data-structure';
import { buildFilePath, locateMany, read } from 'locter';
import fs from 'node:fs';
import path from 'node:path';
import { HELM_OUTPUT_INDEX_DIRECTORY, HELM_OUTPUT_PACKAGE_DIRECTORY } from './constants';
import type { HelmChartsReleaseOptions, HelmChartsVersionizeOptions } from './helpers';
import { HelmChartContainer } from './module';
import {
    extractRegistryHost,
    normalizeHelmChartsReleaseOptions,
    normalizeHelmChartsVersionOptions,
} from './helpers';
import type { IBinary } from '../../bin';
import {
    HelmBinary,
    HelmChartReleaserBinary,
} from '../../bin';
import type {
    HelmChartManagerOptions,
    HelmChartManagerPushOptions,
    IHelmChartContainer,
    IHelmChartManager,
} from './types';

export class HelmChartManager implements IHelmChartManager {
    protected graph : Graph<string>;

    protected items: Record<string, IHelmChartContainer>;

    protected helmBinary : IBinary;

    protected helmChartReleaserBinary : IBinary;

    constructor(options: HelmChartManagerOptions = {}) {
        this.graph = new Graph();

        this.items = {};

        this.helmBinary = options.helmBinary || new HelmBinary();
        this.helmChartReleaserBinary = options.helmChartReleaserBinary || new HelmChartReleaserBinary();
    }

    /**
     * Load a single chart repository from the file system.
     *
     * @param file
     */
    async load(file: string) {
        const filePath = path.isAbsolute(file) ?
            file :
            path.join(process.cwd(), file);

        const data = await read(filePath);
        const container = new HelmChartContainer(data, { path: filePath });

        if (!this.items[container.directoryPath]) {
            this.items[container.directoryPath] = container;

            this.graph.addNode(container.directoryPath);

            for (const dependency of container.dependencies) {
                const dependencyRepositoryPath = dependency.repositoryFilePath;
                if (dependencyRepositoryPath) {
                    this.graph.addEdge(container.directoryPath, dependencyRepositoryPath);
                }
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
            cwd: directory,
        });

        const loadPromises = locations.map(
            (location) => this.load(buildFilePath(location)),
        );

        await Promise.all(loadPromises);
    }

    /**
     * Set/bump version of all scanned helm charts.
     *
     * @param input
     */
    async versionizeCharts(input: HelmChartsVersionizeOptions = {}) {
        const options = normalizeHelmChartsVersionOptions(input);

        const graphFlat = topologicalSort(this.graph)
            .reverse();

        for (const chartPath of graphFlat) {
            const chart = this.items[chartPath];
            if (!chart) {
                continue;
            }

            if (options.version) {
                chart.setVersion(options.version);
            } else {
                chart.bumpVersion();
            }

            const adjacentPaths = this.graph.adjacent(chartPath);
            if (adjacentPaths) {
                adjacentPaths.forEach((adjacentPath) => {
                    const adjacentChart = this.items[adjacentPath];
                    if (adjacentChart) {
                        for (const dependency of chart.dependencies) {
                            if (dependency.repositoryFilePath === adjacentChart.directoryPath) {
                                dependency.data.version = adjacentChart.data.version;
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

    /**
     * Package all scanned helm charts.
     */
    async packageCharts() : Promise<IHelmChartContainer[]> {
        await fs.promises.rm(HELM_OUTPUT_INDEX_DIRECTORY, { recursive: true, force: true });
        await fs.promises.rm(HELM_OUTPUT_PACKAGE_DIRECTORY, { recursive: true, force: true });

        await fs.promises.mkdir(HELM_OUTPUT_INDEX_DIRECTORY, { recursive: true });
        await fs.promises.mkdir(HELM_OUTPUT_PACKAGE_DIRECTORY, { recursive: true });

        const graphFlat = topologicalSort(this.graph)
            .reverse();

        const repositories : Record<string, string> = {};

        for (const chartPath of graphFlat) {
            const chart = this.items[chartPath];
            if (!chart) {
                continue;
            }

            for (const dependency of chart.dependencies) {
                const { repositoryWebURL } = dependency;
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

            await this.helmBinary.execute([
                'dependency',
                'update',
                chart.directoryPathRelativePosix,
            ]);

            await this.helmBinary.execute([
                'package',
                chart.directoryPathRelativePosix,
                '--destination',
                HELM_OUTPUT_PACKAGE_DIRECTORY,
            ]);
        }

        for (const repositoryKey of Object.keys(repositories)) {
            await this.helmBinary.execute([
                'repo',
                'remove',
                repositoryKey,
            ]);
        }

        return Object.values(this.items);
    }

    /**
     * Release all scanned helm charts to GitHub
     * @param input
     */
    async releaseCharts(input: HelmChartsReleaseOptions) : Promise<IHelmChartContainer[]> {
        const options = normalizeHelmChartsReleaseOptions(input);

        const uploadArgs : string[] = [
            '--package-path',
            HELM_OUTPUT_PACKAGE_DIRECTORY,
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

        // --generate-release-notes and --commit are only accepted by upload, not by
        // index (where the -c shorthand means --charts-repo)
        const uploadOnlyArgs : string[] = [];
        if (options.generateReleaseNotes) {
            uploadOnlyArgs.push('--generate-release-notes');
        }

        // chart-releaser forwards this as the release's target_commitish without a
        // default, and GitHub answers 422 for an empty one
        if (options.commit) {
            uploadOnlyArgs.push('--commit', options.commit);
        }

        // release step
        await this.helmChartReleaserBinary.execute([
            'upload',
            '--skip-existing',
            ...uploadOnlyArgs,
            ...uploadArgs,
        ]);

        // update index step
        await this.helmChartReleaserBinary.execute([
            'index',
            '--push',
            '--index-path',
            `${HELM_OUTPUT_INDEX_DIRECTORY}/index.yaml`,
            ...uploadArgs,
        ]);

        return Object.values(this.items);
    }

    /**
     * Push all scanned helm charts to specific oci registry.
     *
     * @param options
     */
    async pushCharts(options: HelmChartManagerPushOptions) {
        // The host may carry a path (ghcr.io/acme/charts), which is where the
        // charts are pushed to, but helm >= 4 rejects anything other than a bare
        // registry when authenticating.
        const registry = extractRegistryHost(options.host);

        try {
            await this.helmBinary.execute(['registry', 'logout', registry]);
        } catch {
            // do nothing
        }

        await this.helmBinary.execute([
            'registry',
            'login',
            registry,
            '--username',
            options.username,
            '--password',
            options.password,
        ]);

        const graphFlat = topologicalSort(this.graph)
            .reverse();

        const pushed : IHelmChartContainer[] = [];

        for (const chartPath of graphFlat) {
            const chart = this.items[chartPath];
            if (!chart) {
                continue;
            }

            if (options.skipExisting) {
                const exists = await this.isChartPresent(options.host, chart.data.name, chart.data.version);
                if (exists) {
                    continue;
                }
            }

            await this.helmBinary.execute([
                'push',
                `${HELM_OUTPUT_PACKAGE_DIRECTORY}/${chart.data.name}-${chart.data.version}.tgz`,
                `oci://${options.host}`,
            ]);

            pushed.push(chart);
        }

        await this.helmBinary.execute(['registry', 'logout', registry]);

        return pushed;
    }

    /**
     * Check if a chart version is already present in an oci registry.
     *
     * A failing lookup is treated as absent, so a transient error leads to a
     * push attempt rather than to a silently skipped chart.
     *
     * @param host
     * @param name
     * @param version
     */
    protected async isChartPresent(host: string, name: string, version: string) : Promise<boolean> {
        try {
            await this.helmBinary.execute([
                'show',
                'chart',
                `oci://${host}/${name}`,
                '--version',
                version,
            ]);

            return true;
        } catch {
            return false;
        }
    }
}
