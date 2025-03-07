import { bumpVersion } from '../../src';

describe('version-bump', () => {
    it('should bump version (patch)', async () => {
        expect(bumpVersion('1.0.0', 'patch')).toEqual('1.0.1');
    });

    it('should bump version (minor)', async () => {
        expect(bumpVersion('1.0.0', 'minor')).toEqual('1.1.0');
    });

    it('should bump version (major)', async () => {
        expect(bumpVersion('1.0.0', 'major')).toEqual('2.0.0');
    });
});
