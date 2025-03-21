/*
 * Copyright (c) 2025-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { normalizeHelmChartsVersionOptions } from '../../../../src';

describe('helm > version', () => {
    it('should normalize', () => {
        const options = normalizeHelmChartsVersionOptions();

        expect(options.commitUserName).toBeDefined();
        expect(options.commitUserEmail).toBeDefined();
    });

    it('should normalize with commitAuthor', () => {
        const options = normalizeHelmChartsVersionOptions({
            commitAuthor: 'name <name@example.com>',
        });

        expect(options.commitAuthorName).toEqual('name');
        expect(options.commitAuthorEmail).toEqual('name@example.com');
    });

    it('should normalize with commitAuthor{Name,Email}', () => {
        const options = normalizeHelmChartsVersionOptions({
            commitAuthorName: 'name',
            commitAuthorEmail: 'name@example.com',
        });

        expect(options.commitAuthor).toEqual('name <name@example.com>');
        expect(options.commitAuthorName).toEqual('name');
        expect(options.commitAuthorEmail).toEqual('name@example.com');
    });
});
