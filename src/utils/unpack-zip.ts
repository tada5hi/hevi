/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { fromBuffer } from 'yauzl';
import { streamToBuffer } from './stream-to-buffer';

type Options = {
    filter?: (name: string) => boolean
};

export async function unpackZip(
    stream: Readable,
    directory: string,
    options: Options = {},
) {
    const buffer = await streamToBuffer(stream);

    return new Promise<void>((resolve, reject) => {
        fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
            if (err) {
                reject(err);
            }

            zipFile.readEntry();
            zipFile.on('entry', (entry) => {
                const isPermitted = options.filter ?
                    options.filter(entry.fileName) :
                    true;

                if (isPermitted) {
                    zipFile.openReadStream(entry, (
                        entryErr,
                        entryStream,
                    ) => {
                        if (entryErr) {
                            reject(entryErr);
                            return;
                        }

                        entryStream.on('end', () => {
                            zipFile.readEntry();
                        });

                        const destinationPath = path.join(directory, entry.fileName);
                        const destinationStream = fs.createWriteStream(destinationPath);

                        entryStream.pipe(destinationStream);
                    });
                } else {
                    zipFile.readEntry();
                }
            });

            zipFile.on('end', () => resolve());
        });
    });
}
