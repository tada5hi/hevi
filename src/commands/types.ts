/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

export type BaseCommandOptions = {
    /**
     * Project root.
     *
     * default: process.cwd()
     */
    cwd?: string,

    /**
     * Relative path in project directory.
     */
    directory?: string,

    /**
     * git token
     */
    token?: string,

    /**
     * default: github
     */
    provider?: string,
};

export type BaseCommandOptionsNormalized = {
    /**
     * Project root.
     *
     * default: process.cwd()
     */
    cwd: string,

    /**
     * Relative path in project directory.
     */
    directory: string,

    /**
     * git token
     */
    token?: string,

    /**
     * default: github
     */
    provider?: string,
};
