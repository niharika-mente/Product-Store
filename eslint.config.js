import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist", "node_modules", "build", ".husky", "FRONTEND/**", "BACKEND/demo.js", "*.js"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
