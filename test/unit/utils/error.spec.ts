/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { extractErrorMessage } from '../../../src/utils';

describe('utils > error', () => {
    it('should extract message of an error instance', () => {
        expect(extractErrorMessage(new Error('foo'))).toEqual('foo');
    });

    it('should extract message of an error subclass instance', () => {
        class FooError extends Error {}

        expect(extractErrorMessage(new FooError('bar'))).toEqual('bar');
    });

    it('should extract message of a string', () => {
        expect(extractErrorMessage('baz')).toEqual('baz');
    });

    it('should extract message of an object with a message property', () => {
        expect(extractErrorMessage({ message: 'qux' })).toEqual('qux');
    });

    it('should fall back for an object with a non string message property', () => {
        expect(extractErrorMessage({ message: 42 })).toEqual('An unknown error occurred.');
    });

    it('should fall back for values without a message', () => {
        expect(extractErrorMessage(undefined)).toEqual('An unknown error occurred.');
        expect(extractErrorMessage(null)).toEqual('An unknown error occurred.');
        expect(extractErrorMessage(42)).toEqual('An unknown error occurred.');
        expect(extractErrorMessage({})).toEqual('An unknown error occurred.');
        expect(extractErrorMessage([])).toEqual('An unknown error occurred.');
    });
});
