// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["**/__tests__/**", "**/*.test.{ts,tsx}", "**/__mocks__/**"],
    rules: {
      "import/no-unresolved": "off", // Disable import resolution for test files
    },
  },
  {
    files: ["**/amplify-config.{ts,js}", "**/amplify-init.ts"],
    rules: {
      "import/no-unresolved": "off", // aws-exports is a generated file, not in repo
    },
  },
]);
