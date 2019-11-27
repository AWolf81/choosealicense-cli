module.exports = {
    extends: ['react-app', 'plugin:jest/recommended'],
    parser: 'babel-eslint',
    parserOptions: {
      ecmaVersion: 6,
      allowImportExportEverywhere: true,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
        modules: true,
      },
    },
    rules: {
      'no-unused-vars': 1,
      'no-shadow': 2,
      'jest/no-large-snapshots': ['warn', { maxSize: 100 }],
    },
    overrides: [],
  };