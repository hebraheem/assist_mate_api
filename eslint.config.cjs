const prettierPlugin = require('eslint-plugin-prettier');
const nodePlugin = require('eslint-plugin-node');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Define environment globals directly
        NodeJS: true, // NodeJS globals (like `global`, `process`)
        module: true, // Allow `module` object (e.g., `module.exports`)
        require: true, // Allow `require` function
        jest: true, // Jest testing globals (if you're using Jest)
      },
    },
    plugins: {
      prettier: prettierPlugin,
      node: nodePlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'node/no-unpublished-require': 'off',
    },
  },
];
