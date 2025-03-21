/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { defineCommand } from 'citty';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../constants';
import {
    defineCLIHelmChartReleaserCommand,
    defineCLIHelmCommand,
    defineCLIPackageCommand,
    defineCLIPushCommand,
    defineCLIReleaseCommand,
    defineCLIVersionCommand,
} from './commands';

export async function createCLIEntryPointCommand() {
    const pkgRaw = await fs.promises.readFile(
        path.join(ROOT_DIR, 'package.json'),
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
            package: defineCLIPackageCommand(),
            push: defineCLIPushCommand(),
            release: defineCLIReleaseCommand(),
            version: defineCLIVersionCommand(),

            helm: defineCLIHelmCommand(),
            helmChartReleaser: defineCLIHelmChartReleaserCommand(),
        },
    });
}
