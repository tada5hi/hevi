/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { HelmChart, HelmChartDependency } from '../../../../src';
import { HelmChartContainer, HelmChartDependencyContainer } from '../../../../src';

const CHART_DIRECTORY = path.join(process.cwd(), 'charts', 'foo');

function createParent() : HelmChartContainer {
    const data : HelmChart = {
        apiVersion: 'v2',
        name: 'foo',
        description: 'A Helm chart for Kubernetes',
        type: 'application',
        version: '0.1.0',
        appVersion: '1.16.0',
    };

    return new HelmChartContainer(data, { path: path.join(CHART_DIRECTORY, 'Chart.yaml') });
}

function createDependency(data: Partial<HelmChartDependency> = {}) {
    return new HelmChartDependencyContainer(
        {
            name: 'bar',
            version: '0.1.0',
            ...data,
        },
        createParent(),
    );
}

describe('helm > chart > dependency', () => {
    it('should resolve a file repository relative to the parent directory', () => {
        const dependency = createDependency({ repository: 'file://../bar' });

        expect(dependency.repositoryFilePath).toEqual(path.join(process.cwd(), 'charts', 'bar'));
        expect(dependency.repositoryWebURL).toBeNull();
    });

    it('should resolve a http repository as web url', () => {
        const dependency = createDependency({ repository: 'http://example.com/charts' });

        expect(dependency.repositoryWebURL).toEqual('http://example.com/charts');
        expect(dependency.repositoryFilePath).toBeNull();
    });

    it('should resolve a https repository as web url', () => {
        const dependency = createDependency({ repository: 'https://example.com/charts' });

        expect(dependency.repositoryWebURL).toEqual('https://example.com/charts');
        expect(dependency.repositoryFilePath).toBeNull();
    });

    it('should not resolve an oci repository', () => {
        const dependency = createDependency({ repository: 'oci://example.com/charts' });

        expect(dependency.repositoryFilePath).toBeNull();
        expect(dependency.repositoryWebURL).toBeNull();
    });

    it('should not resolve a missing repository', () => {
        const dependency = createDependency();

        expect(dependency.repositoryFilePath).toBeNull();
        expect(dependency.repositoryWebURL).toBeNull();
    });

    it('should strip quotes from the repository', () => {
        const dependency = createDependency({ repository: '"https://example.com/charts"' });

        expect(dependency.data.repository).toEqual('https://example.com/charts');
        expect(dependency.repositoryWebURL).toEqual('https://example.com/charts');
    });
});
