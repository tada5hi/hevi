/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { Parser } from 'tar';

type Options = {
    filter?: (name: string) => boolean,
    name?: (name: string) => string,
};
export async function unpackTar(
    stream: Readable,
    directory: string,
    options: Options = {},
) {
    const parser = new Parser({
        filter: (path) => {
            if (options.filter) {
                return options.filter(path);
            }

            return true;
        },
        onReadEntry: (entry) => {
            const localPath = options.name ?
                options.name(entry.path) :
                entry.path;

            const destinationPath = path.join(directory, localPath);
            const destinationDirectoryPath = path.dirname(destinationPath);

            fs.promises.mkdir(destinationDirectoryPath, { recursive: true });

            const destinationStream = fs.createWriteStream(destinationPath);

            entry.pipe(destinationStream);
        },
    });

    return new Promise<void>((
        resolve,
        reject,
    ) => {
        parser.on('end', () => resolve());
        parser.on('error', (err) => reject(err));

        stream.pipe(parser);
    });
}
