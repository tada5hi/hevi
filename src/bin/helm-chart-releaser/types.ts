/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HelmChartReleaserOptions = {
    /**
     * helm releaser version
     *
     * default: 1.7.0
     */
    version?: string,
    /**
     * Machine arch (x64, ...)
     */
    arch?: string,
    /**
     * Machine platform (win32, linux, ...)
     */
    platform?: string,

    /**
     * output directory
     */
    cwd?: string
};
