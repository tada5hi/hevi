import config from '@tada5hi/eslint-config';

export default [
    ...await config(),
    { ignores: ['dist/**', 'coverage/**'] },
    // Promise.try requires Node 24; this package supports Node 22.
    { rules: { 'unicorn/prefer-promise-try': 'off' } },
    // Preserve the published Node 20/22 runtime floor.
    { rules: { 'unicorn/prefer-error-is-error': 'off' } },
];
