/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';

export function defineCLIVersionBumpCommand() {
    return defineCommand({
        meta: {
            name: 'bump',
        },
        async setup() {

        },
    });
}
