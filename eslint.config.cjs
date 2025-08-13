const js = require("@eslint/js");
const globals = require("globals");
const pluginReact = require("eslint-plugin-react");

module.exports = [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { 
      js: js.plugin 
    },
    rules: {
      ...js.configs.recommended.rules
    },
    languageOptions: { 
      globals: globals.browser 
    },
  },
  pluginReact.configs.flat.recommended,
];