/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { download } from '../../utils';
import { Binary } from '../module';
import type { HelmChartReleaserOptions } from './types';

export class HelmChartReleaserBinary extends Binary {
    // ---------------------------------------------------------------------------

    constructor(options: HelmChartReleaserOptions = {}) {
        super();

        this.version = options.version || '1.7.0';
        this.platform = options.platform || os.platform();
        this.arch = options.arch || os.arch();
        this.cwd = options.cwd || process.cwd();
    }

    // ---------------------------------------------------------------------------

    async download() {
        if (
            this.platform !== 'darwin' &&
            this.platform !== 'win32' &&
            this.platform !== 'linux'
        ) {
            throw new Error(`Platform ${this.platform} has no remote source.`);
        }

        await download({
            directory: this.directory,
            url: this.downloadURL,
            filter: (name) => name === this.name,
        });

        try {
            await fs.promises.access(this.path, fs.constants.F_OK);
        } catch (e) {
            throw new Error(`The downloaded binary directory does not contain a ${this.name} file.`);
        }
    }

    get downloadURL() {
        return `https://github.com/helm/chart-releaser/releases/download/v${this.version}/${this.downloadURLFileName}`;
    }

    get downloadURLFileName() {
        const arch = this.arch === 'x64' ? 'amd64' : this.arch;
        if (this.platform === 'win32') {
            return `chart-releaser_${this.version}_windows_${arch}.zip`;
        }
        return `chart-releaser_${this.version}_${this.platform}_${arch}.tar.gz`;
    }

    // ---------------------------------------------------------------------------

    get directory() {
        const basePath = process.env.RUNNER_TOOL_CACHE || os.tmpdir();

        return path.join(basePath, 'hevi-helm-chart-releaser', this.version, this.platform, this.arch);
    }

    get name() {
        if (this.platform === 'win32') {
            return 'cr.exe';
        }

        return 'cr';
    }

    get path() {
        return path.join(this.directory, this.name);
    }
}
