/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';
import consola from 'consola';
import process from 'node:process';
import { HelmChartsManager } from '../../helm';

export function defineCLIPushCommand() {
    return defineCommand({
        meta: {
            name: 'push',
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
            owner: {
                type: 'string',
                description: 'Github owner name (user or organization)',
            },
            repo: {
                type: 'string',
                description: 'Github repository name',
            },
            branch: {
                type: 'string',
                description: 'Github pages branch',
            },
            token: {
                type: 'string',
                description: 'Git token',
            },
        },
        async setup(ctx) {
            const manager = new HelmChartsManager({
                cwd: ctx.args.cwd,
                directory: ctx.args.directory,
            });

            try {
                const charts = await manager.pushCharts({
                    repo: ctx.args.repo,
                    owner: ctx.args.owner,
                    token: ctx.args.token,
                    branch: ctx.args.branch,
                });

                for (let i = 0; i < charts.length; i++) {
                    consola.success(`pushed chart ${charts[i].name} (${charts[i].meta.directoryPath})`);
                }

                process.exit(0);
            } catch (e) {
                if (e instanceof Error) {
                    consola.error(e.message);
                }
            }
        },
    });
}
