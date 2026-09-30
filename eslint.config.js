import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import checkFile from 'eslint-plugin-check-file';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import {defineConfig} from 'eslint/config';

const TS_FILES = ['**/*.{ts,tsx}'];

// Google TypeScript Style Guide where applicable
const GOOGLE_TS_RULES = {
  '@typescript-eslint/naming-convention': [
    'error',
    {selector: 'default', format: ['camelCase']},
    {selector: 'import', format: ['camelCase', 'PascalCase']},
    {selector: 'function', format: ['camelCase', 'PascalCase']},
    {
      selector: 'variable',
      modifiers: ['const', 'global'],
      format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
    },
    {selector: 'variable', modifiers: ['destructured'], format: null},
    {selector: 'typeLike', format: ['PascalCase']},
    {selector: 'enumMember', format: ['UPPER_CASE']},
    // Data keys: section keys, HTML attributes, HTTP headers
    {selector: 'objectLiteralProperty', format: null},
    {selector: 'typeProperty', format: null},
  ],
  'no-restricted-exports': [
    'error',
    {restrictDefaultExports: {direct: true, named: true, defaultFrom: true}},
  ],
  'func-style': ['error', 'declaration'],
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    {accessibility: 'no-public'},
  ],
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/no-namespace': 'error',
  curly: ['error', 'all'],
  eqeqeq: ['error', 'smart'],
  'no-var': 'error',
  'prefer-const': 'error',
  'no-restricted-syntax': [
    'error',
    {
      selector: 'PrivateIdentifier',
      message: 'Use TypeScript visibility (private) instead of #private.',
    },
    {
      selector: 'TSEnumDeclaration[const=true]',
      message: 'Use a plain enum, not const enum.',
    },
  ],
};

export default defineConfig([
  {ignores: ['.netlify/', 'public/assets/*/vendor/']},
  js.configs.recommended,
  {
    files: TS_FILES,
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {'check-file': checkFile},
    rules: {
      ...GOOGLE_TS_RULES,
      'check-file/filename-naming-convention': [
        'error',
        {'src/**/*.{ts,tsx}': 'SNAKE_CASE'},
        {ignoreMiddleExtensions: true},
      ],
    },
  },
  {
    files: ['netlify/functions/**/*.ts'],
    rules: {
      // Netlify reads the handler from the default export
      'no-restricted-exports': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      // node:test tracks the promise that test() returns
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: globals.browser,
    },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
]);
