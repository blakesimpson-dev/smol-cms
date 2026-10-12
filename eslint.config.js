import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import checkFile from 'eslint-plugin-check-file';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import {defineConfig} from 'eslint/config';

import {GOOGLE_TS_RULES} from './eslint.gts.js';

const TS_FILES = ['**/*.{ts,tsx}'];

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
