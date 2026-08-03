/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type BinaryOptions = {
    /**
     * binary version
     */
    version?: string,

    /**
     * Machine arch (x64, ...)
     */
    arch?: string,

    /**
     * Machine platform (win32, linux, ...)
     */
    platform?: string,

    /**
     * output directory
     */
    cwd?: string
};

/**
 * An executable which is either resolved via PATH or downloaded on demand.
 *
 * Consumers depend on this abstraction instead of a concrete binary, so that
 * fake implementations can be plugged in.
 */
export interface IBinary {
    /**
     * Run the binary with the given arguments and resolve with its stdout.
     *
     * @param args
     */
    execute(args: string[]) : Promise<string>;

    /**
     * Download the binary into {@see directory}.
     */
    download() : Promise<void>;

    /**
     * Directory the binary is downloaded to.
     */
    readonly directory : string;

    /**
     * File name of the executable (platform dependent).
     */
    readonly name : string;

    /**
     * Absolute path of the executable.
     */
    readonly path : string;
}
