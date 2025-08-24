module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: [],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  ignorePatterns: ["node_modules/", "frontend/dist/", "reports/"],
  rules: {
    // Interdit tout hasard côté backend
    "no-restricted-syntax": [
      "error",
      { selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
        message: "Math.random() interdit: remplace par métriques mesurées ou status:'unknown'." }
    ],
    // Empêche valeurs magiques évidentes
    "no-magic-numbers": ["warn", { ignore: [0,1,-1], ignoreArrayIndexes: true, enforceConst: true }],
    // Interdit les catch silencieux
    "no-empty": ["error", { allowEmptyCatch: false }],
    // Alerte sur exports douteux
    "no-duplicate-imports": "error",
    "no-undef": "error"
  }
};