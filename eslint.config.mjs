import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "next-env.d.ts"
    ]
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        React: "readonly"
      }
    },
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off"
    }
  }
]);
