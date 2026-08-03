/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BinaryOptions } from '../types';

export type HelmChartReleaserOptions = BinaryOptions & {
    /**
     * helm releaser version
     *
     * default: 1.7.0
     */
    version?: string
};
