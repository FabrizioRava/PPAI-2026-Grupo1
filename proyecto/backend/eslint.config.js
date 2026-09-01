const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
    },
    rules: {
      // El proyecto usa `any` deliberadamente en varios DTOs de respuesta y en catch(error: any);
      // se deja como warning para no forzar un refactor de tipado fuera de alcance.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
