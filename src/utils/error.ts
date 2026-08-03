/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Extract a human readable message from an arbitrary thrown value.
 *
 * Anything can be thrown in JavaScript (Error, string, plain object, ...),
 * therefore the input is narrowed step by step.
 *
 * @param input
 */
export function extractErrorMessage(input: unknown) : string {
    if (input instanceof Error) {
        return input.message;
    }

    if (typeof input === 'string') {
        return input;
    }

    if (
        typeof input === 'object' &&
        input !== null &&
        'message' in input &&
        typeof input.message === 'string'
    ) {
        return input.message;
    }

    return 'An unknown error occurred.';
}
