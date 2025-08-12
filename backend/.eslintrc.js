module.exports = {
  env: {
    node: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    'plugin:sonarjs/recommended'
  ],
  plugins: ['sonarjs'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {},
  overrides: [
    {
      files: ['test/**/*.js', '**/*.test.js'],
      env: {
        jest: true,
        mocha: true
      },
      rules: {
        'no-console': 'off',
        'sonarjs/no-duplicate-string': 'off'
      }
    }
  ]
};