export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        exports: "readonly",
        module: "readonly",
        require: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      "quotes": ["error", "double", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "never"],
      "indent": ["error", 2],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"]
    },
    ignores: [
      "node_modules/**",
      "dist/**",
      ".build/**",
      ".out/**",
      ".vercel/**",
      ".frontend/**",
      "frontend/.next/**",
      "frontend/dist/**",
      "**/*.min.js"
    ]
  }
];