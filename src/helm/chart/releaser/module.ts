/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Options } from 'tinyexec';
import { download, executeShellCommand } from '../../../utils';
import { HELM_CHART_RELEASER_NAME } from './constants';
import type { HelmReleaserOptions } from './types';

export class HelmReleaser {
    protected version: string;

    protected arch : string;

    protected platform: string;

    protected cwd : string;

    constructor(options: HelmReleaserOptions = {}) {
        this.version = options.version || '1.7.0';
        this.platform = options.platform || os.platform();
        this.arch = options.arch || os.arch();
        this.cwd = options.cwd || process.cwd();
    }

    async execute(args: string[]): Promise<string> {
        const options = this.buildShellOptions();

        let execPath :string | undefined;
        try {
            execPath = await executeShellCommand(
                'which',
                [this.execFileName],
                options,
            );
        } catch (e) {
            // todo: do nothing
        }

        if (execPath) {
            return executeShellCommand(this.execFileName, args, options);
        }

        try {
            await fs.promises.access(this.execFilePath, fs.constants.F_OK);
        } catch (e) {
            await this.downloadExec();
        }

        try {
            await fs.promises.access(this.execFilePath, fs.constants.X_OK);
        } catch (e) {
            await fs.promises.chmod(this.execFilePath, 0o755);
        }

        // fix EBUSY (nodejs)
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 100);
        });

        return executeShellCommand(
            this.execFileName,
            args,
            options,
        );
    }

    async downloadExec() {
        if (!this.isPlatformSupportedForDownload(this.platform)) {
            throw new Error(`Platform ${this.platform} has no remote source.`);
        }

        const url = this.buildDownloadURL();

        await download({
            directory: this.execDirectory,
            url,
            filter: (name) => name === this.execFileName,
        });

        try {
            await fs.promises.access(this.execFilePath, fs.constants.F_OK);
        } catch (e) {
            throw new Error(`The downloaded binary directory does not contain a ${this.execFileName} file.`);
        }

        return this.execFilePath;
    }

    private isPlatformSupportedForDownload(platform: string): boolean {
        return platform === 'darwin' || platform === 'win32' || platform === 'linux';
    }

    private buildDownloadURL() {
        return `https://github.com/helm/chart-releaser/releases/download/v${this.version}/${this.buildDownloadFileName()}`;
    }

    private buildDownloadFileName() {
        const arch = this.arch === 'x64' ? 'amd64' : this.arch;
        if (this.platform === 'win32') {
            return `chart-releaser_${this.version}_windows_${arch}.zip`;
        }
        return `chart-releaser_${this.version}_${this.platform}_${arch}.tar.gz`;
    }

    get execDirectory() {
        const basePath = process.env.RUNNER_TOOL_CACHE || os.tmpdir();

        // todo: rename to hevi-helm-chart-releaser
        return path.join(basePath, HELM_CHART_RELEASER_NAME, this.version, this.platform, this.arch);
    }

    get execFileName() {
        if (this.platform === 'win32') {
            return 'cr.exe';
        }

        return 'cr';
    }

    get execFilePath() {
        return path.join(this.execDirectory, this.execFileName);
    }

    private buildShellOptions() : Partial<Options> {
        return {
            nodeOptions: {
                cwd: this.cwd,
                env: {
                    ...process.env,
                    PATH: this.execDirectory + (this.platform === 'win32' ? ';' : ':') + process.env.PATH,
                },
            },
        };
    }
}
