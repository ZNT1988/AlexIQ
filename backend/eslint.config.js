import js from '@eslint/js';
import sonarjs from 'eslint-plugin-sonarjs';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_READONLY = 'readonly';

export default [
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: STR_READONLY,
        Buffer: STR_READONLY,
        __dirname: STR_READONLY,
        __filename: STR_READONLY,
        console: STR_READONLY,
        global: STR_READONLY,
        module: STR_READONLY,
        require: STR_READONLY,
        exports: STR_READONLY,
        setTimeout: STR_READONLY,
        setInterval: STR_READONLY,
        clearTimeout: STR_READONLY,
        clearInterval: STR_READONLY,
        setImmediate: STR_READONLY,
        clearImmediate: STR_READONLY,
        URL: STR_READONLY,
        URLSearchParams: STR_READONLY,
        TextEncoder: STR_READONLY,
        TextDecoder: STR_READONLY,
        btoa: STR_READONLY,
        atob: STR_READONLY
        crypto: STR_READONLY,
        BigInt: STR_READONLY,
        BigInt64Array: STR_READONLY,
        BigUint64Array: STR_READONLY,
        queueMicrotask: STR_READONLY,
        structuredClone: STR_READONLY,
        AbortController: STR_READONLY,
        AbortSignal: STR_READONLY,
        Event: STR_READONLY,
        EventTarget: STR_READONLY,
        MessageChannel: STR_READONLY,
        MessagePort: STR_READONLY,
        Worker: STR_READONLY,
        performance: STR_READONLY,
        PerformanceObserver: STR_READONLY,
        WebAssembly: STR_READONLY,
        fetch: STR_READONLY,
        Request: STR_READONLY,
        Response: STR_READONLY,
        Headers: STR_READONLY
        FormData: STR_READONLY,
        ReadableStream: STR_READONLY,
        WritableStream: STR_READONLY,
        TransformStream: STR_READONLY,
        CompressionStream: STR_READONLY,
        DecompressionStream: STR_READONLY,
        BroadcastChannel: STR_READONLY,
        CustomEvent: STR_READONLY,
        DOMException: STR_READONLY,
        File: STR_READONLY,
        Blob: STR_READONLY,
        FileReader: STR_READONLY,
        SharedArrayBuffer: STR_READONLY,
        Atomics: STR_READONLY
      }
    },
    rules: {
      // SonarJS specific rules
      'sonarjs/cognitive-complexity': [STR_ERROR, 15],
      'sonarjs/no-duplicate-string': [STR_ERROR, { threshold: 3 }],
      'sonarjs/no-identical-functions': STR_ERROR,
      'sonarjs/no-redundant-boolean': STR_ERROR,
      'sonarjs/no-unused-collection': STR_ERROR,
      'sonarjs/no-useless-catch': STR_ERROR,
      'sonarjs/prefer-immediate-return': STR_ERROR,
      'sonarjs/prefer-object-literal': STR_ERROR,
      'sonarjs/prefer-single-boolean-return': STR_ERROR,
      // General code quality rules
      'no-console': 'warn',
      'no-unused-vars': STR_ERROR,
      'no-var': STR_ERROR,
      'prefer-const': STR_ERROR,
      'no-eval': STR_ERROR,
      'no-implied-eval': STR_ERROR,
      'no-new-func': STR_ERROR,
      'no-script-url': STR_ERROR,
      'no-proto': STR_ERROR,
      'no-iterator': STR_ERROR,
      'no-with': STR_ERROR,
      'no-debugger': STR_ERROR,
      'no-alert': STR_ERROR,
      // Security rules
      'no-unsafe-negation': STR_ERROR,
      'no-unsafe-finally': STR_ERROR,
      'no-unreachable': STR_ERROR,
      'no-fallthrough': STR_ERROR
    }
  },
  {
    files: ['test/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        describe: STR_READONLY,
        it: STR_READONLY,
        test: STR_READONLY,
        expect: STR_READONLY,
        beforeEach: STR_READONLY,
        afterEach: STR_READONLY,
        before: STR_READONLY,
        after: STR_READONLY,
        jest: STR_READONLY
      }
    },
    rules: {
      'no-console': 'off',
      'sonarjs/no-duplicate-string': 'off'
    }
  },
  {
    ignores: ['node_modules/**', 'logs/**', 'cache/**', '**/*.log', 'generated_media/**', 'data/**', '**/*.sqlite', 'coverage/**', 'dist/**', 'build/**']
  }
];