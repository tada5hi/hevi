/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { download } from '../../utils';
import { Binary } from '../module';
import type { HelmBinOptions } from './types';

export class HelmBinary extends Binary {
    // ---------------------------------------------------------------------------

    constructor(options: HelmBinOptions = {}) {
        super();

        this.version = options.version || '3.17.2';
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
            name: (name) => path.basename(name),
            filter: (name) => name.endsWith(this.name),
        });

        try {
            await fs.promises.access(this.path, fs.constants.F_OK);
        } catch (e) {
            throw new Error(`The downloaded binary directory does not contain a ${this.name} file.`);
        }
    }

    get downloadURL() {
        return `https://get.helm.sh/${this.downloadURLFileName}`;
    }

    get downloadURLFileName() {
        const arch = this.arch === 'x64' ? 'amd64' : this.arch;
        if (this.platform === 'win32') {
            return `helm-v${this.version}-windows-${arch}.zip`;
        }
        return `helm-v${this.version}-${this.platform}-${arch}.tar.gz`;
    }

    // ---------------------------------------------------------------------------

    get directory() {
        const basePath = process.env.RUNNER_TOOL_CACHE || os.tmpdir();

        return path.join(basePath, 'hevi-helm', this.version, this.platform, this.arch);
    }

    get path() {
        return path.join(this.directory, this.name);
    }

    get name() {
        if (this.platform === 'win32') {
            return 'helm.exe';
        }

        return 'helm';
    }
}
