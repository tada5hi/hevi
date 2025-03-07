import { defineCommand } from 'citty';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
    defineCLIVersionBumpCommand,
    defineCLIVersionSetCommand,
} from './commands';

export async function createCLIEntryPointCommand() {
    const pkgRaw = await fs.promises.readFile(
        path.join(process.cwd(), 'package.json'),
        { encoding: 'utf8' },
    );
    const pkg = JSON.parse(pkgRaw);

    return defineCommand({
        meta: {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description,
        },
        subCommands: {
            versionBump: defineCLIVersionBumpCommand(),
            versionSet: defineCLIVersionSetCommand(),
        },
        args: {
            cwd: {
                type: 'string',
                description: 'Config directory path',
                default: process.cwd(),
            },
        },
        async setup() {
            // todo maybe read config
        },
    });
}
