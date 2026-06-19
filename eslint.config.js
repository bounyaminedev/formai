import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const browserGlobals = {
  document: 'readonly',
  fetch: 'readonly',
  localStorage: 'readonly',
  URLSearchParams: 'readonly',
  window: 'readonly',
};

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['frontend/**/*.js'],
    languageOptions: { globals: browserGlobals },
  },
  prettier,
  {
    ignores: ['dist', 'node_modules'],
  },
);
