// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

// Our stricter TypeScript and code quality rules
const stricterRules = {
  // === Unused Code Detection ===
  // Disable base rule to avoid conflicts with TypeScript-specific rule
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      vars: "all",
      args: "after-used",
      argsIgnorePattern: "^_",
      ignoreRestSiblings: true,
      caughtErrors: "all",
      caughtErrorsIgnorePattern: "^_",
    },
  ],

  // === Type Safety ===
  // Prevent any type usage (forces proper typing)
  "@typescript-eslint/no-explicit-any": "warn",

  // === Code Quality ===
  // Disable base rule to avoid conflicts with TypeScript-specific rule
  "no-unused-expressions": "off",
  // Prevent unused expressions (statements that don't do anything)
  "@typescript-eslint/no-unused-expressions": [
    "warn",
    {
      allowShortCircuit: true,
      allowTernary: true,
      allowTaggedTemplates: true,
    },
  ],

  // Prefer for-of loops over traditional for loops
  "@typescript-eslint/prefer-for-of": "warn",

  // === Consistency ===
  // Consistent type definitions (prefer interface over type)
  "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],

  // Consistent indexed object style
  "@typescript-eslint/consistent-indexed-object-style": [
    "warn",
    "index-signature",
  ],

  // === Best Practices ===
  // Prevent duplicate enum values
  "@typescript-eslint/no-duplicate-enum-values": "warn",

  // Disable base rule to avoid conflicts with TypeScript-specific rule
  "no-loss-of-precision": "off",
  // Prevent loss of precision
  "@typescript-eslint/no-loss-of-precision": "warn",

  // Require using namespace keyword instead of module
  "@typescript-eslint/prefer-namespace-keyword": "warn",

  // Disallow non-null assertions using the ! postfix operator
  "@typescript-eslint/no-non-null-assertion": "warn",

  // Prevent unnecessary type constraints
  "@typescript-eslint/no-unnecessary-type-constraint": "warn",

  // === React/JSX Specific ===
  // Prevent missing key prop in iterators
  "react/jsx-key": [
    "warn",
    {
      checkFragmentShorthand: true,
      checkKeyMustBeforeSpread: true,
    },
  ],

  // Prevent missing React import (not needed in React 17+, but good practice)
  "react/react-in-jsx-scope": "off",

  // Require hooks to follow rules
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",

  // === General JavaScript ===
  // Prefer const over let when variable is never reassigned
  "prefer-const": "warn",

  // Disallow var (use let/const)
  "no-var": "error",

  // Require === and !== instead of == and !=
  eqeqeq: ["warn", "always", { null: "ignore" }],

  // Disallow console.log (use proper logging)
  "no-console": [
    "warn",
    {
      allow: ["warn", "error", "info"],
    },
  ],

  // Prevent debugger statements
  "no-debugger": "warn",

  // Prevent alert, confirm, prompt
  "no-alert": "warn",
};

// Extend expoConfig by merging our stricter rules into configs that have @typescript-eslint plugin
const extendedConfig = expoConfig.map((config) => {
  // If this config has the TypeScript plugin, merge our rules
  if (config.plugins && config.plugins["@typescript-eslint"]) {
    return {
      ...config,
      rules: {
        ...config.rules,
        ...stricterRules,
      },
    };
  }
  return config;
});

module.exports = defineConfig([
  ...extendedConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["**/__tests__/**", "**/*.test.{ts,tsx}", "**/__mocks__/**"],
    rules: {
      "import/no-unresolved": "off", // Disable import resolution for test files
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "none", // More lenient in tests (mocks often have unused params)
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
      "no-console": "off", // Allow console in tests
    },
  },
  {
    files: ["**/amplify-config.{ts,js}", "**/amplify-init.ts"],
    rules: {
      "import/no-unresolved": "off", // aws-exports is a generated file, not in repo
    },
  },
]);
