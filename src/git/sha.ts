/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createHash } from 'node:crypto';

export function computeGitSha(content: string) {
    const textEncoder = new TextEncoder();
    const encoded = textEncoder.encode(content);

    return createHash('sha1').update(`blob ${encoded.length}\0`).update(content).digest('hex');
}
