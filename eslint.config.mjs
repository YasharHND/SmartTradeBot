import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.{ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['error'],
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-explicit-any': ['error'],
      'no-console': 'warn',
      'no-duplicate-imports': 'error',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/coverage/**',
      '**/.aws-cdk/**',
      '**/cdk.out/**',
      '**/dist/**',
      'lint-staged.config.mjs',
      'eslint.config.mjs',
    ],
  },
];
