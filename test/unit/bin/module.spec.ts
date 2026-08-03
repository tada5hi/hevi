/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {
    describe,
    expect,
    it,
} from 'vitest';
import { Binary } from '../../../src';

/**
 * A binary which is guaranteed to be resolvable via PATH, so the
 * download branch of Binary.execute() is never entered.
 */
class NodeBinary extends Binary {
    public downloadCalled = false;

    constructor() {
        super({ version: '0.0.0' }, '0.0.0');
    }

    async download() {
        this.downloadCalled = true;
    }

    get directory() {
        return path.join(os.tmpdir(), 'hevi-test-binary');
    }

    get name() {
        return process.platform === 'win32' ? 'node.exe' : 'node';
    }

    get path() {
        return path.join(this.directory, this.name);
    }
}

describe('binary > module', () => {
    it('should apply option defaults', () => {
        const bin = new NodeBinary();

        expect(bin.directory).toEqual(path.join(os.tmpdir(), 'hevi-test-binary'));
    });

    it('should execute a binary resolved via PATH', async () => {
        const bin = new NodeBinary();

        const output = await bin.execute(['--version']);

        expect(output.trim()).toEqual(process.version);
        expect(bin.downloadCalled).toBeFalsy();
    });

    it('should throw on a non zero exit code', async () => {
        const bin = new NodeBinary();

        await expect(bin.execute(['-e', 'process.stderr.write("boom"); process.exit(1);']))
            .rejects
            .toThrow('boom');
    });
});
