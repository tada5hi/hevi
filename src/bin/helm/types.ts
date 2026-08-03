/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BinaryOptions } from '../types';

export type HelmBinOptions = BinaryOptions & {
    /**
     * helm version
     *
     * default: 4.2.3
     */
    version?: string
};
