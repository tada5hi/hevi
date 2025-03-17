/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';
import consola from 'consola';
import { isObject } from 'locter';
import process from 'node:process';
import { HelmVersionType, Provider } from '../../constants';
import { HelmChartsManager } from '../../helm';

export function defineCLIVersionCommand() {
    return defineCommand({
        meta: {
            name: 'version',
        },
        args: {
            cwd: {
                type: 'string',
                default: process.cwd(),
                description: 'Working directory path',
            },
            directory: {
                type: 'positional',
                default: '.',
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
            commitUser: {
                type: 'string',
                description: 'The user name and email address in the format: Display Name <email@address.com>',
            },
            commitUserEmail: {
                type: 'string',
                description: 'Commit user email',
            },
            commitUserName: {
                type: 'string',
                description: 'Commit user name',
            },
            commitAuthor: {
                type: 'string',
                description: 'The author name and email address in the format: Display Name <email@address.com>',
            },
            commitAuthorName: {
                type: 'string',
                description: 'Commit author name',
            },
            commitAuthorEmail: {
                type: 'string',
                description: 'Commit author email',
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
                valueHint: `${Object.values(Provider).join('|')}`,
            },
            version: {
                type: 'string',
                description: 'Set specific version',
            },
            versionType: {
                type: 'string',
                valueHint: `${Object.values(HelmVersionType).join('|')}`,
            },
        },
        async setup(ctx) {
            const helm = new HelmChartsManager({
                directory: ctx.args.directory,
                cwd: ctx.args.cwd,
            });

            try {
                const charts = await helm.versionCharts({
                    version: ctx.args.version,
                    versionType: ctx.args.versionType,
                    token: ctx.args.token,
                    branch: ctx.args.branch,
                    commit: ctx.args.commit,
                    commitUser: ctx.args.commitUser,
                    commitUserEmail: ctx.args.commitUserEmail,
                    commitUserName: ctx.args.commitUserName,
                    commitAuthor: ctx.args.commitAuthor,
                    commitAuthorEmail: ctx.args.commitAuthorEmail,
                    commitAuthorName: ctx.args.commitAuthorName,
                    push: ctx.args.push,
                });

                for (let i = 0; i < charts.length; i++) {
                    consola.success(
                        `versioned chart ${charts[i].name} (${charts[i].meta.directoryPath})`,
                        { version: charts[i].version, appVersion: charts[i].appVersion },
                    );
                }

                process.exit(0);
            } catch (e) {
                if (isObject(e)) {
                    consola.warn(e?.message || 'An unknown error occurred.');
                }
                process.exit(1);
            }
        },
    });
}
