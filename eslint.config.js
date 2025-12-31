// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const tseslint = require("@typescript-eslint/eslint-plugin");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Stricter rules for unused variables and parameters
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used", // Warn if unused AND after last used param
          argsIgnorePattern: "^_", // Allow _param naming convention for intentionally unused
          ignoreRestSiblings: true,
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
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
    },
  },
  {
    files: ["**/amplify-config.{ts,js}", "**/amplify-init.ts"],
    rules: {
      "import/no-unresolved": "off", // aws-exports is a generated file, not in repo
    },
  },
]);
