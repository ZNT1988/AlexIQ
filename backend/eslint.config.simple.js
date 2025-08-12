import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        Buffer: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        global: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-eval": "error",
      "no-debugger": "error",
    },
  },
  {
    files: ["test/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: ["node_modules/**", "logs/**", "cache/**", "**/*.log"],
  },
];
