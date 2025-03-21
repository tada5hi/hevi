/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';

export const ROOT_DIR = path.join(__dirname, '..');

export enum LogLevel {
    INFO = 'info',
    DEFAULT = 'default',
    WARN = 'warn',
    SUCCESS = 'success',
    ERROR = 'error',
}
