import globals from "globals";

export default [
  {
    files: ["**/*.js"], 
    rules: {
      semi: ["error", "always"]
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