// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

const STR_WARN = 'warn';

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@vitejs/eslint-config-react',
    'plugin:sonarjs/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: ['react-refresh', 'react-hooks', 'sonarjs'],
  rules: {
    // React Rules
    'react-refresh/only-export-components': [
      STR_WARN,
      { allowConstantExport: true },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': STR_WARN,
    'react-hooks/rules-of-hooks': STR_ERROR,
    'react-hooks/exhaustive-deps': STR_WARN,
    // Modern JavaScript Rules
    'no-var': STR_ERROR,
    'prefer-const': STR_ERROR,
    'prefer-arrow-callback': STR_ERROR,
    'no-console': STR_WARN,
    'no-debugger': STR_WARN,
    // Code Quality
    'no-unused-vars': [
      STR_ERROR,
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'no-undef': STR_ERROR,
    eqeqeq: [STR_ERROR, 'always'],
    // Performance Rules
    'no-inner-declarations': STR_ERROR,
    'no-loop-func': STR_ERROR,
    // SonarJS Rules
    'sonarjs/cognitive-complexity': [STR_ERROR, 15],
    'sonarjs/no-duplicate-string': [STR_ERROR, 3],
    'sonarjs/no-identical-functions': STR_ERROR,
    'sonarjs/no-redundant-boolean': STR_ERROR,
    'sonarjs/no-unused-collection': STR_ERROR,
    'sonarjs/no-useless-catch': STR_ERROR,
    'sonarjs/prefer-immediate-return': STR_ERROR,
    'sonarjs/prefer-object-literal': STR_ERROR,
    'sonarjs/prefer-single-boolean-return': STR_ERROR,
    // Accessibility
    'jsx-a11y/alt-text': STR_WARN,
    'jsx-a11y/anchor-is-valid': STR_WARN,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
