/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Options } from 'tinyexec';
import { download, executeShellCommand } from '../../utils';
import type { HelmBinOptions } from './types';

export class HelmBinary {
    protected version: string;

    protected arch : string;

    protected platform: string;

    protected cwd : string;

    // ---------------------------------------------------------------------------

    constructor(options: HelmBinOptions = {}) {
        this.version = options.version || '3.17.2';
        this.platform = options.platform || os.platform();
        this.arch = options.arch || os.arch();
        this.cwd = options.cwd || process.cwd();
    }

    // ---------------------------------------------------------------------------

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
            await this.download();
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

    async download() {
        if (!this.isPlatformSupportedForDownload(this.platform)) {
            throw new Error(`Platform ${this.platform} has no remote source.`);
        }

        await download({
            directory: this.directoryPath,
            url: this.downloadURL,
            name: (name) => path.basename(name),
            filter: (name) => name.endsWith(this.execFileName),
        });

        try {
            await fs.promises.access(this.execFilePath, fs.constants.F_OK);
        } catch (e) {
            throw new Error(`The downloaded binary directory does not contain a ${this.execFileName} file.`);
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

    get directoryPath() {
        const basePath = process.env.RUNNER_TOOL_CACHE || os.tmpdir();

        return path.join(basePath, 'hevi-helm', this.version, this.platform, this.arch);
    }

    get execFilePath() {
        return path.join(this.directoryPath, this.execFileName);
    }

    get execFileName() {
        if (this.platform === 'win32') {
            return 'helm.exe';
        }

        return 'helm';
    }

    // ---------------------------------------------------------------------------

    private isPlatformSupportedForDownload(platform: string): boolean {
        return platform === 'darwin' || platform === 'win32' || platform === 'linux';
    }

    private buildShellOptions() : Partial<Options> {
        return {
            nodeOptions: {
                cwd: this.cwd,
                env: {
                    ...process.env,
                    PATH: this.directoryPath + (this.platform === 'win32' ? ';' : ':') + process.env.PATH,
                },
            },
        };
    }
}
