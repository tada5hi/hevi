/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import hapic from 'hapic';
import os from 'node:os';
import path from 'node:path';
import type { PassThrough, Readable, Writable } from 'node:stream';
import stream from 'node:stream';
import { fromBuffer } from 'yauzl';
import { Parser } from 'tar';
import { executeShellCommand } from '../../utils/exec';
import { streamToBuffer } from '../../utils/stream-to-buffer';
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
        let execPath :string | undefined;
        try {
            execPath = await executeShellCommand({ cmd: 'which', args: ['hr'], cwd: this.cwd });
        } catch (e) {
            // todo: do nothing
        }

        if (execPath) {
            return executeShellCommand({ cmd: execPath, args, cwd: this.cwd });
        }

        try {
            await fs.promises.access(this.executableFileName(), fs.constants.F_OK);
        } catch (e) {
            await this.download();
        }

        await new Promise<void>(
            (resolve) => setTimeout(() => { resolve(); }, 100),
        );

        return executeShellCommand({ cmd: `./${this.executableFileName()}`, args, cwd: this.cwd });
    }

    async download() {
        if (!this.isPlatformSupportedForDownload(this.platform)) {
            throw new Error(`Platform ${this.platform} has no remote source.`);
        }

        const url = this.buildDownloadURL();

        const filePath = path.join(this.cwd, this.executableFileName());

        const writeStream = fs.createWriteStream(filePath);
        const response = await hapic.get(url, { responseType: 'stream' });

        const readStream = stream.Readable.fromWeb(response.data as any);

        await this.unpack(readStream, writeStream);

        return filePath;
    }

    protected async unpack(input: Readable, output: Writable | PassThrough) {
        if (this.platform === 'win32') {
            await this.unpackZip(input, output);
            return;
        }

        await this.unpackTar(input, output);
    }

    protected async unpackZip(input: Readable, output: Writable | PassThrough) {
        const buffer = await streamToBuffer(input);

        return new Promise<void>((resolve, reject) => {
            fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
                if (err) {
                    reject(err);
                }

                zipFile.readEntry();
                zipFile.on('entry', (entry) => {
                    if ((entry.fileName as string).endsWith('.exe')) {
                        zipFile.openReadStream(entry, (
                            entryErr,
                            entryStream,
                        ) => {
                            if (entryErr) {
                                reject(entryErr);
                                return;
                            }

                            entryStream.on('end', () => {
                                resolve();
                            });

                            entryStream.pipe(output);
                        });
                    } else {
                        zipFile.readEntry();
                    }
                });
            });
        });
    }

    protected async unpackTar(input: Readable, output: Writable | PassThrough) {
        let found : boolean = false;
        const parser = new Parser({
            filter: (path) => {
                if (path === 'cr') {
                    found = true;
                    return true;
                }

                return false;
            },
            onReadEntry: (entry) => {
                entry.pipe(output);
            },
        });

        return new Promise<void>((
            resolve,
            reject,
        ) => {
            parser.on('end', () => {
                if (!found) {
                    reject(new Error('The executable was not found in the tar archive.'));
                }

                resolve();
            });

            input.pipe(parser);
        });
    }

    private executableFileName() {
        if (this.platform === 'win32') {
            return 'hr.exe';
        }

        return 'hr';
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
}
