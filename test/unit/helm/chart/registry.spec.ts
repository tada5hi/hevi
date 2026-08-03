/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { extractRegistryHost } from '../../../../src';

describe('helm > chart > helpers > registry', () => {
    it('should keep a bare host', () => {
        expect(extractRegistryHost('ghcr.io')).toEqual('ghcr.io');
    });

    it('should keep a host with a port', () => {
        expect(extractRegistryHost('localhost:5000')).toEqual('localhost:5000');
    });

    it('should strip a path', () => {
        expect(extractRegistryHost('ghcr.io/authup/helm-charts')).toEqual('ghcr.io');
    });

    it('should strip a scheme', () => {
        expect(extractRegistryHost('oci://ghcr.io')).toEqual('ghcr.io');
    });

    it('should strip a scheme and a path', () => {
        expect(extractRegistryHost('oci://ghcr.io/authup/helm-charts')).toEqual('ghcr.io');
    });

    it('should trim surrounding whitespace', () => {
        expect(extractRegistryHost('  ghcr.io/acme  ')).toEqual('ghcr.io');
    });
});
