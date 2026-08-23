import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Testimony corpora carry their own .js artifacts (verify scripts etc.) —
  // package contents, not site code; never lint them.
  {
    ignores: [
      "dist",
      ".next",
      ".netlify",
      "next-env.d.ts",
      "public",
      "testimonies",
      "testimony_queue",
      "Chronological Testimonies",
    ],
  },
  // TypeScript + React app code (both renderers: vite src/ and Next app/)
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          // react-markdown components destructure `node` purely to keep it
          // out of the DOM-props spread — destructure-to-omit is intentional.
          ignoreRestSiblings: true,
        },
      ],
      // Lax-mode holdovers from the pre-gate era; ratchet down as the
      // strictNullChecks burn-down progresses (see docs plan, Phase 0.6).
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // shadcn/ui primitives co-export their cva variants/context hooks by
  // design (vendored library pattern) — the fast-refresh nudge doesn't apply.
  // Nor to the App Router tree: pages co-export metadata/generateStaticParams
  // by contract, and Next's own Fast Refresh handles them.
  {
    files: ["src/components/ui/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  // Plain JS/JSX components (worldmap realm) — was never linted before
  {
    extends: [js.configs.recommended],
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  // Node-side pipeline scripts (plain JS/ESM)
  {
    extends: [js.configs.recommended],
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  // Node-side pipeline scripts (TypeScript) + vite config
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["scripts/**/*.ts", "vite.config.ts", "next.config.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
