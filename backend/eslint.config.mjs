import globals from "globals";

export default [
  {
    files: ["**/*.js"], 
    rules: {
      semi: ["error", "always"],
      indent: ["error", 2],
      "object-curly-newline": ["error", {
        "ObjectExpression": { "multiline": true, "minProperties": 3 },
        "ObjectPattern": { "multiline": true },
        "ImportDeclaration": { "multiline": true, "minProperties": 3 },
        "ExportDeclaration": { "multiline": true, "minProperties": 3 }
      }],
      "no-multiple-empty-lines": "error"
    },
    languageOptions: {
      sourceType: "commonjs"
    }
  },
  {
    languageOptions: { 
      globals: globals.browser 
    }
  },
];