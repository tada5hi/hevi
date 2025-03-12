/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

interface DisplayNameEmail {
    name: string
    email: string
}

/**
 * @see https://github.com/peter-evans/create-pull-request/blob/a7759c6f845add8bbb34383885a4367cc0d43210/src/utils.ts#L68C17-L68C38
 *
 * @param displayNameEmail
 */
export function parseDisplayNameEmail(
    displayNameEmail: string,
): DisplayNameEmail {
    // Parse the name and email address from a string in the following format
    // Display Name <email@address.com>
    const pattern = /^([^<]+)\s*<([^>]+)>$/i;

    // Check we have a match
    const match = displayNameEmail.match(pattern);
    if (!match) {
        throw new Error(
            `The format of '${displayNameEmail}' is not a valid email address with display name`,
        );
    }

    // Check that name and email are not just whitespace
    const name = match[1].trim();
    const email = match[2].trim();
    if (!name || !email) {
        throw new Error(
            `The format of '${displayNameEmail}' is not a valid email address with display name`,
        );
    }

    return {
        name,
        email,
    };
}

export function buildDisplayNameEmail(name: string, email: string) {
    return `${name} <${email}>`;
}
