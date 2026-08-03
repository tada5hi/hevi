/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import os from 'node:os';
import type { Options } from 'tinyexec';
import { executeShellCommand } from '../utils';
import type { BinaryOptions, IBinary } from './types';

export abstract class Binary implements IBinary {
    protected version: string;

    protected arch : string;

    protected platform: string;

    protected cwd : string;

    // ---------------------------------------------------------------------------

    protected constructor(options: BinaryOptions, versionDefault: string) {
        this.version = options.version || versionDefault;
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
                [this.name],
                options,
            );
        } catch {
            // the binary is not available in PATH and has to be downloaded
        }

        if (execPath) {
            return executeShellCommand(this.name, args, options);
        }

        try {
            await fs.promises.access(this.path, fs.constants.F_OK);
        } catch {
            await this.download();
        }

        try {
            await fs.promises.access(this.path, fs.constants.X_OK);
        } catch {
            await fs.promises.chmod(this.path, 0o755);
        }

        // fix EBUSY (nodejs)
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 100);
        });

        return executeShellCommand(
            this.name,
            args,
            options,
        );
    }

    // ---------------------------------------------------------------------------

    abstract download() : Promise<void>;

    // ---------------------------------------------------------------------------

    protected buildShellOptions() : Partial<Options> {
        return {
            nodeOptions: {
                cwd: this.cwd,
                env: {
                    ...process.env,
                    HELM_EXPERIMENTAL_OCI: '1',
                    PATH: this.directory + (this.platform === 'win32' ? ';' : ':') + process.env.PATH,
                },
            },
        };
    }

    // ---------------------------------------------------------------------------

    abstract get directory() : string;

    abstract get name() : string;

    abstract get path() : string;
}
