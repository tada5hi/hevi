/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Reduce an oci reference to the bare registry host.
 *
 * Charts are pushed to a reference that usually carries a path, e.g.
 * ghcr.io/acme/charts, but `helm registry login` only accepts the registry
 * itself. helm 3 tolerated the path, helm 4 rejects it with
 * "invalid reference: invalid registry".
 *
 * @param input host, optionally with a scheme and a path
 */
export function extractRegistryHost(input: string) : string {
    let value = input.trim();

    const schemeIndex = value.indexOf('://');
    if (schemeIndex !== -1) {
        value = value.substring(schemeIndex + 3);
    }

    const slashIndex = value.indexOf('/');
    if (slashIndex !== -1) {
        value = value.substring(0, slashIndex);
    }

    return value;
}
