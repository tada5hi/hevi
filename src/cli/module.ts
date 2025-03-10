/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { HelmVersionType, Provider } from '../constants';
import { execute } from '../module';

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
        args: {
            cwd: {
                type: 'string',
                description: 'Config directory path',
                default: process.cwd(),
            },
            directory: {
                type: 'string',
                description: 'Relative directory path (default: .)',
            },
            branch: {
                type: 'string',
                description: 'Branch',
            },
            commit: {
                type: 'boolean',
                description: 'Commit git changes',
                default: false,
            },
            commitUserName: {
                type: 'string',
                description: 'Commit user name',
            },
            commitUserEmail: {
                type: 'string',
                description: 'Commit user email',
            },
            commitAuthor: {
                type: 'string',
                description: 'Commit author',
            },
            push: {
                type: 'boolean',
                description: 'Push git changes',
                default: false,
            },
            token: {
                type: 'string',
                description: 'Git token',
            },
            provider: {
                type: 'string',
                default: Provider.GITHUB,
                options: Object.values(Provider),
            },
            version: {
                type: 'string',
                description: 'Set specific version',
            },
            versionType: {
                type: 'string',
                options: Object.values(HelmVersionType),
            },
        },
        async setup(ctx) {
            await execute({
                cwd: ctx.args.cwd,
                directory: ctx.args.directory,
                version: ctx.args.version,
                versionType: ctx.args.versionType,
                token: ctx.args.token,
                branch: ctx.args.branch,
                commit: ctx.args.commit,
                commitUserEmail: ctx.args.commitUserEmail,
                commitUserName: ctx.args.commitUserName,
                commitAuthor: ctx.args.commitAuthor,
                push: ctx.args.push,
            });

            process.exit(0);
        },
    });
}
