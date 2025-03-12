/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { normalizeExecuteOptions } from '../../../../src';

describe('commands > execute > normalize', () => {
    it('should normalize', () => {
        const options = normalizeExecuteOptions();

        expect(options.cwd).toEqual(process.cwd());
        expect(options.directory).toEqual('.');
        expect(options.commitUserName).toBeDefined();
        expect(options.commitUserEmail).toBeDefined();
    });

    it('should normalize with commitAuthor', () => {
        const options = normalizeExecuteOptions({
            commitAuthor: 'name <name@example.com>',
        });

        expect(options.commitAuthorName).toEqual('name');
        expect(options.commitAuthorEmail).toEqual('name@example.com');
    });

    it('should normalize with commitAuthor{Name,Email}', () => {
        const options = normalizeExecuteOptions({
            commitAuthorName: 'name',
            commitAuthorEmail: 'name@example.com',
        });

        expect(options.commitAuthor).toEqual('name <name@example.com>');
        expect(options.commitAuthorName).toEqual('name');
        expect(options.commitAuthorEmail).toEqual('name@example.com');
    });
});
