/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import hapic from 'hapic';
import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream';
import { unpackTar } from './unpack-tar';
import { unpackZip } from './unpack-zip';

type DownloaderOptions = {
    filter?: (fileName: string) => boolean,
    name?: (name: string) => string,
    cwd?: string,
    directory: string,
    url: string
};

export async function download(options: DownloaderOptions) {
    let destinationPath : string;
    if (path.isAbsolute(options.directory)) {
        destinationPath = options.directory;
    } else {
        destinationPath = path.join(options.cwd || process.cwd(), options.directory);
    }

    await fs.promises.mkdir(destinationPath, { recursive: true });

    const response = await hapic.get(options.url, { responseType: 'stream' });
    const readStream = stream.Readable.fromWeb(response.data as any);

    const isZip = options.url.substring(options.url.length - 3) === 'zip';
    if (isZip) {
        await unpackZip(readStream, destinationPath, {
            filter: options.filter,
            name: options.name,
        });
    } else {
        await unpackTar(readStream, destinationPath, {
            filter: options.filter,
            name: options.name,
        });
    }
}
