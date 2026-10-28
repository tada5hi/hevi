import config from '@tada5hi/eslint-config';

export default [
    ...await config(),
    { ignores: ['dist/**', 'coverage/**'] },
    {
        rules: {
            // maintainer: declined 2026-10-28
            'unicorn/no-return-array-push': 'off',
        },
    },
];
