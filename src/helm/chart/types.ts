/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IBinary } from '../../bin';
import type { HelmChartsReleaseOptions, HelmChartsVersionizeOptions } from './helpers';

export type HelmChart = {
    apiVersion: string,
    name: string,
    description: string,
    type: 'application' | 'library',
    version: string,
    appVersion: string,
    dependencies?: HelmChartDependency[],
};

export type HelmChartDependency = {
    name: string,
    version: string,
    repository?: string,
};

export type HelmChartManagerPushOptions = {
    host: string,
    username: string,
    password: string,

    /**
     * Skip charts whose name and version already exist in the registry,
     * so re-running the push on an unchanged branch is a no-op.
     *
     * default: false
     */
    skipExisting?: boolean,
};

export type HelmChartManagerOptions = {
    /**
     * Binary used to run helm commands.
     *
     * default: new HelmBinary()
     */
    helmBinary?: IBinary,

    /**
     * Binary used to run helm chart-releaser (cr) commands.
     *
     * default: new HelmChartReleaserBinary()
     */
    helmChartReleaserBinary?: IBinary
};

/**
 * A dependency entry of a helm chart.
 */
export interface IHelmChartDependencyContainer {
    /**
     * The chart the dependency belongs to.
     */
    parent : IHelmChartContainer;

    /**
     * The raw dependency entry.
     */
    data : HelmChartDependency;

    /**
     * Absolute path of the referenced chart directory,
     * if the repository is a file:// reference.
     */
    readonly repositoryFilePath : string | null;

    /**
     * The repository url, if it is a http(s) reference.
     */
    readonly repositoryWebURL : string | null;
}

/**
 * A single helm chart (Chart.yaml) loaded from the file system.
 */
export interface IHelmChartContainer {
    /**
     * The raw chart definition.
     */
    data : HelmChart;

    /**
     * The dependencies of the chart.
     */
    dependencies : IHelmChartDependencyContainer[];

    /**
     * Absolute path of the Chart.yaml file.
     */
    path : string;

    /**
     * Write the (modified) chart definition back to {@see path}.
     */
    save() : Promise<void>;

    /**
     * Set an explicit version.
     *
     * @param version
     */
    setVersion(version: string) : void;

    /**
     * Increase the patch version by one.
     */
    bumpVersion() : void;

    /**
     * Serialize the chart definition to yaml.
     */
    serialize() : string;

    readonly pathRelative : string;

    readonly pathRelativePosix : string;

    readonly directoryPath : string;

    readonly directoryPathRelative : string;

    readonly directoryPathRelativePosix : string;
}

/**
 * Loads helm charts from the file system and runs helm/chart-releaser
 * commands against them in dependency order.
 */
export interface IHelmChartManager {
    /**
     * Load a single chart from the file system.
     *
     * @param file
     */
    load(file: string) : Promise<void>;

    /**
     * Load all charts below the given directory.
     *
     * @param directory
     */
    loadMany(directory: string) : Promise<void>;

    /**
     * Set/bump the version of all loaded charts.
     *
     * @param input
     */
    versionizeCharts(input?: HelmChartsVersionizeOptions) : Promise<IHelmChartContainer[]>;

    /**
     * Package all loaded charts.
     */
    packageCharts() : Promise<IHelmChartContainer[]>;

    /**
     * Release all packaged charts to GitHub.
     *
     * @param input
     */
    releaseCharts(input: HelmChartsReleaseOptions) : Promise<IHelmChartContainer[]>;

    /**
     * Push all packaged charts to an oci registry.
     *
     * @param options
     */
    pushCharts(options: HelmChartManagerPushOptions) : Promise<IHelmChartContainer[]>;
}
