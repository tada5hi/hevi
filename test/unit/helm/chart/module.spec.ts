/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import type { HelmChart } from '../../../../src';
import { HelmChartContainer } from '../../../../src';

function createChart(data: Partial<HelmChart> = {}) : HelmChart {
    return {
        apiVersion: 'v2',
        name: 'foo',
        description: 'A Helm chart for Kubernetes',
        type: 'application',
        version: '0.1.0',
        appVersion: '1.16.0',
        ...data,
    };
}

describe('helm > chart > container', () => {
    it('should default the path to Chart.yml in the current working directory', () => {
        const container = new HelmChartContainer(createChart());

        expect(container.path).toEqual(path.join(process.cwd(), 'Chart.yml'));
    });

    it('should set a version', () => {
        const container = new HelmChartContainer(createChart());

        container.setVersion('2.3.4');

        expect(container.data.version).toEqual('2.3.4');
    });

    it('should bump the patch version', () => {
        const container = new HelmChartContainer(createChart({ version: '1.2.3' }));

        container.bumpVersion();

        expect(container.data.version).toEqual('1.2.4');
    });

    it('should keep the version when none is set', () => {
        const container = new HelmChartContainer(createChart({ version: undefined as unknown as string }));

        container.bumpVersion();

        expect(container.data.version).toBeUndefined();
    });

    it('should serialize to yaml', () => {
        const container = new HelmChartContainer(createChart());

        expect(parse(container.serialize())).toEqual(createChart());
    });

    it('should build path variants relative to the current working directory', () => {
        const filePath = path.join(process.cwd(), 'charts', 'foo', 'Chart.yaml');
        const container = new HelmChartContainer(createChart(), { path: filePath });

        expect(container.pathRelative).toEqual(path.join('charts', 'foo', 'Chart.yaml'));
        expect(container.pathRelativePosix).toEqual('charts/foo/Chart.yaml');
        expect(container.directoryPath).toEqual(path.join(process.cwd(), 'charts', 'foo'));
        expect(container.directoryPathRelative).toEqual(path.join('charts', 'foo'));
        expect(container.directoryPathRelativePosix).toEqual('charts/foo');
    });

    it('should wrap dependencies in containers', () => {
        const container = new HelmChartContainer(createChart({
            dependencies: [
                {
                    name: 'bar',
                    version: '0.1.0',
                    repository: 'file://../bar',
                },
                { name: 'baz', version: '0.2.0' },
            ],
        }));

        expect(container.dependencies.length).toEqual(2);
        expect(container.dependencies[0]?.data.name).toEqual('bar');
        expect(container.dependencies[0]?.parent).toEqual(container);
        expect(container.dependencies[1]?.data.name).toEqual('baz');
    });

    it('should have no dependencies when none are defined', () => {
        const container = new HelmChartContainer(createChart());

        expect(container.dependencies).toEqual([]);
    });
});
