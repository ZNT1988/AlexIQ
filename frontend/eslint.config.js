import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_READONLY = 'readonly';
export default [
  js.configs.recommended
  react.configs.flat.recommended
  sonarjs.configs.recommended
  {
    plugins: {
      'react-hooks': reactHooks
    }
    languageOptions: {
      ecmaVersion: 2022
      sourceType: 'module'
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
      globals: {
        window: STR_READONLY
        document: STR_READONLY
        console: STR_READONLY
        process: STR_READONLY
        global: STR_READONLY
        setTimeout: STR_READONLY
        setInterval: STR_READONLY
        clearTimeout: STR_READONLY
        clearInterval: STR_READONLY
        setImmediate: STR_READONLY
        clearImmediate: STR_READONLY
        localStorage: STR_READONLY
        sessionStorage: STR_READONLY
        fetch: STR_READONLY
        WebSocket: STR_READONLY
        URLSearchParams: STR_READONLY
        URL: STR_READONLY
        performance: STR_READONLY
        navigator: STR_READONLY
        location: STR_READONLY
        history: STR_READONLY
        screen: STR_READONLY
        devicePixelRatio: STR_READONLY
        innerWidth: STR_READONLY
        innerHeight: STR_READONLY
        outerWidth: STR_READONLY
        outerHeight: STR_READONLY
        scrollX: STR_READONLY
        scrollY: STR_READONLY
        pageXOffset: STR_READONLY
        pageYOffset: STR_READONLY
        alert: STR_READONLY
        confirm: STR_READONLY
        prompt: STR_READONLY
        open: STR_READONLY
        close: STR_READONLY
        print: STR_READONLY
        focus: STR_READONLY
        blur: STR_READONLY
        getComputedStyle: STR_READONLY
        matchMedia: STR_READONLY
        requestAnimationFrame: STR_READONLY
        cancelAnimationFrame: STR_READONLY
        requestIdleCallback: STR_READONLY
        cancelIdleCallback: STR_READONLY
        Blob: STR_READONLY
        File: STR_READONLY
        FileList: STR_READONLY
        FileReader: STR_READONLY
        FormData: STR_READONLY
        HTMLElement: STR_READONLY
        Element: STR_READONLY
        Node: STR_READONLY
        Event: STR_READONLY
        CustomEvent: STR_READONLY
        EventTarget: STR_READONLY
        MutationObserver: STR_READONLY
        ResizeObserver: STR_READONLY
        IntersectionObserver: STR_READONLY
        XMLHttpRequest: STR_READONLY
        Headers: STR_READONLY
        Request: STR_READONLY
        Response: STR_READONLY
        AbortController: STR_READONLY
        AbortSignal: STR_READONLY
        Worker: STR_READONLY
        SharedWorker: STR_READONLY
        ServiceWorker: STR_READONLY
        MessageChannel: STR_READONLY
        MessagePort: STR_READONLY
        BroadcastChannel: STR_READONLY
        ImageData: STR_READONLY
        CanvasRenderingContext2D: STR_READONLY
        WebGLRenderingContext: STR_READONLY
        AudioContext: STR_READONLY
        webkitAudioContext: STR_READONLY
        webkitSpeechRecognition: STR_READONLY
        SpeechSynthesis: STR_READONLY
        Notification: STR_READONLY
        Geolocation: STR_READONLY
        MediaStream: STR_READONLY
        MediaRecorder: STR_READONLY
        crypto: STR_READONLY
        SubtleCrypto: STR_READONLY
        TextEncoder: STR_READONLY
        TextDecoder: STR_READONLY
        btoa: STR_READONLY
        atob: STR_READONLY
        parseInt: STR_READONLY
        parseFloat: STR_READONLY
        isNaN: STR_READONLY
        isFinite: STR_READONLY
        decodeURI: STR_READONLY
        decodeURIComponent: STR_READONLY
        encodeURI: STR_READONLY
        encodeURIComponent: STR_READONLY
        escape: STR_READONLY
        unescape: STR_READONLY
        DOMParser: STR_READONLY
        XMLSerializer: STR_READONLY
        Image: STR_READONLY
        Audio: STR_READONLY
        Option: STR_READONLY
      }
    }
    settings: {
      react: {
        version: 'detect'
      }
    }
    rules: {
      // SonarJS specific rules
      'sonarjs/cognitive-complexity': [STR_ERROR, 15]
      'sonarjs/no-duplicate-string': [STR_ERROR, { threshold: 3 }]
      'sonarjs/no-identical-functions': STR_ERROR
      'sonarjs/no-redundant-boolean': STR_ERROR
      'sonarjs/no-unused-collection': STR_ERROR
      'sonarjs/no-useless-catch': STR_ERROR
      'sonarjs/prefer-immediate-return': STR_ERROR
      'sonarjs/prefer-object-literal': STR_ERROR
      'sonarjs/prefer-single-boolean-return': STR_ERROR
      // React specific rules
      'react/react-in-jsx-scope': 'off'
      'react/prop-types': STR_WARN
      'react/no-unused-prop-types': STR_ERROR
      'react/jsx-uses-react': STR_ERROR
      'react/jsx-uses-vars': STR_ERROR
      'react/jsx-no-undef': STR_ERROR
      'react/jsx-no-duplicate-props': STR_ERROR
      'react/jsx-no-bind': STR_WARN
      'react/no-direct-mutation-state': STR_ERROR
      'react/no-typos': STR_ERROR
      'react/no-string-refs': STR_ERROR
      // React Hooks rules
      'react-hooks/rules-of-hooks': STR_ERROR
      'react-hooks/exhaustive-deps': STR_WARN
      // General code quality rules
      'no-console': STR_WARN
      'no-unused-vars': STR_ERROR
      'no-var': STR_ERROR
      'prefer-const': STR_ERROR
      'no-eval': STR_ERROR
      'no-implied-eval': STR_ERROR
      'no-new-func': STR_ERROR
      'no-script-url': STR_ERROR
      'no-proto': STR_ERROR
      'no-iterator': STR_ERROR
      'no-with': STR_ERROR
      'no-debugger': STR_ERROR
      'no-alert': STR_ERROR
      // Security rules
      'no-unsafe-negation': STR_ERROR
      'no-unsafe-finally': STR_ERROR
      'no-unreachable': STR_ERROR
      'no-fallthrough': STR_ERROR
    }
  }
  {
    files: ['**/*.test.js', '**/*.test.jsx']
    languageOptions: {
      globals: {
        describe: STR_READONLY
        it: STR_READONLY
        test: STR_READONLY
        expect: STR_READONLY
        beforeEach: STR_READONLY
        afterEach: STR_READONLY
        before: STR_READONLY
        after: STR_READONLY
        jest: STR_READONLY
        vitest: STR_READONLY
      }
    }
    rules: {
      'no-console': 'off'
      'sonarjs/no-duplicate-string': 'off'
    }
  }
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**', 'coverage/**']
  }
];