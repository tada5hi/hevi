/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import type { HelmChartsPushOptions, HelmChartsVersionOptions } from './helpers';
import { normalizeHelmChartsManagerOptions } from './normalize';
import {
    bumpHelmChartVersion, normalizeHelmChartsPushOptions, normalizeHelmChartsVersionOptions, setHelmChartVersion,
} from './helpers';
import { executeShellCommand } from '../utils/exec';
import { executeGitCommand, executeGitCommit, executeGitPush } from '../git';
import type { HelmChart, HelmChartsManagerOptions, HelmChartsManagerOptionsNormalized } from './index';
import { findHelmCharts } from './read';
import { writeHelmCharts } from './write';
import {
    HelmReleaser,
} from './releaser';
import { buildDisplayNameEmail } from '../utils';

export class HelmChartsManager {
    protected options: HelmChartsManagerOptionsNormalized;

    protected charts: HelmChart[];

    protected chartsRead: boolean;

    protected releaser : HelmReleaser;

    constructor(options: HelmChartsManagerOptions = {}) {
        this.options = normalizeHelmChartsManagerOptions(options);
        this.charts = [];
        this.chartsRead = false;

        this.releaser = new HelmReleaser();
    }

    async loadCharts(force?: boolean) : Promise<HelmChart[]> {
        if (this.chartsRead && !force) {
            return this.charts;
        }

        this.charts = await findHelmCharts({
            cwd: path.join(this.options.cwd, this.options.directory),
        });
        this.chartsRead = true;

        return this.charts;
    }

    async versionCharts(input: HelmChartsVersionOptions = {}) {
        await this.loadCharts();

        const options = normalizeHelmChartsVersionOptions(input);

        for (let i = 0; i < this.charts.length; i++) {
            if (options.version) {
                setHelmChartVersion(this.charts[i], options.version, options.versionType);
            } else {
                bumpHelmChartVersion(this.charts[i], options.versionType);
            }
        }

        if (options.commit) {
            await writeHelmCharts(this.charts);

            for (let i = 0; i < this.charts.length; i++) {
                await executeGitCommand({
                    args: [
                        'add',
                        this.charts[i].meta.directoryPath,
                    ],
                    cwd: this.options.cwd,
                });
            }

            await executeGitCommit({
                cwd: this.options.cwd,
                message: 'chore: update helm charts',
                userName: options.commitUserName,
                userEmail: options.commitUserEmail,
                author: options.commitAuthor ?
                    options.commitAuthor :
                    buildDisplayNameEmail(options.commitUserName, options.commitUserEmail),
            });

            if (options.push) {
                await executeGitPush({
                    cwd: this.options.cwd,
                    branch: options.branch,
                });
            }
        }

        return this.charts;
    }

    async buildCharts() : Promise<HelmChart[]> {
        await this.loadCharts();

        await executeShellCommand(
            'rm',
            [
                '-rf',
                '.cr-index',
            ],
            {
                nodeOptions: {
                    cwd: this.options.cwd,
                },
            },
        );

        await executeShellCommand(
            'rm',
            [
                '-rf',
                '.cr-release-packages',
            ],
            {
                nodeOptions: {
                    cwd: this.options.cwd,
                },
            },
        );

        for (let i = 0; i < this.charts.length; i++) {
            const chart = this.charts[i];

            await this.releaser.execute([
                'package',
                chart.meta.directoryPath,
                '--package-path',
                '.cr-release-packages',
            ]);
        }

        return this.charts;
    }

    async pushCharts(input: HelmChartsPushOptions) {
        await this.loadCharts();

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

        return this.charts;
    }
}
