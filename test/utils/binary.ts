/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IBinary } from '../../src';

/**
 * In-memory {@see IBinary} which records the arguments it was called with
 * instead of spawning a process.
 */
export class FakeBinary implements IBinary {
    readonly calls : string[][] = [];

    readonly directory : string = '/tmp/hevi-fake-binary';

    readonly name : string;

    readonly path : string;

    protected output : string;

    /**
     * Predicate deciding which invocations exit non zero, mirroring how the
     * real binary signals e.g. a chart that is absent from a registry.
     */
    failWhen : (args: string[]) => boolean = () => false;

    constructor(name = 'fake', output = '') {
        this.name = name;
        this.path = `${this.directory}/${name}`;
        this.output = output;
    }

    async execute(args: string[]) : Promise<string> {
        this.calls.push(args);

        if (this.failWhen(args)) {
            throw new Error(`fake ${this.name} failed: ${args.join(' ')}`);
        }

        return this.output;
    }

    async download() : Promise<void> {
        // nothing to download
    }

    /**
     * All recorded calls which start with the given argument.
     *
     * @param arg
     */
    callsOf(arg: string) : string[][] {
        return this.calls.filter((args) => args[0] === arg);
    }
}
