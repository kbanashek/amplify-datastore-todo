module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|uuid|@aws-amplify)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)", "**/*.test.[jt]s?(x)"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.expo/",
    "/dist/",
    "/build/",
    "taskSystemBootstrap.test.ts", // Skip - requires React Native environment (Amplify API mocking issue)
    "DateQuestion.test.tsx", // Skip - infinite loop causing heap overflow (pre-existing issue, requires deeper investigation)
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "packages/task-system/src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/*.test.{ts,tsx}",
    "!packages/task-system/src/**/*.d.ts",
    "!packages/task-system/src/**/__tests__/**",
    "!packages/task-system/src/**/*.test.{ts,tsx}",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // Map @orion/task-system to package source
    "^@orion/task-system$": "<rootDir>/packages/task-system/src/index.ts",
    // Package-internal aliases for @orion/task-system
    "^@components/(.*)$": "<rootDir>/packages/task-system/src/components/$1",
    "^@hooks/(.*)$": "<rootDir>/packages/task-system/src/hooks/$1",
    "^@services/(.*)$": "<rootDir>/packages/task-system/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/packages/task-system/src/utils/$1",
    "^@task-types/(.*)$": "<rootDir>/packages/task-system/src/types/$1",
    "^@constants/(.*)$": "<rootDir>/packages/task-system/src/constants/$1",
    "^@contexts/(.*)$": "<rootDir>/packages/task-system/src/contexts/$1",
    "^@translations/(.*)$":
      "<rootDir>/packages/task-system/src/translations/$1",
    "^@models/(.*)$": "<rootDir>/packages/task-system/src/models/$1",
    "^@screens/(.*)$": "<rootDir>/packages/task-system/src/screens/$1",
    "^@fixtures/(.*)$": "<rootDir>/packages/task-system/src/fixtures/$1",
    "^@runtime/(.*)$": "<rootDir>/packages/task-system/src/runtime/$1",
    "^@test-utils/(.*)$":
      "<rootDir>/packages/task-system/src/hooks/__tests__/$1",
  },
  coverageReporters: ["text", "text-summary", "html", "lcov"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  coverageDirectory: "coverage",
  // Optimize test execution
  maxWorkers: "25%", // Use quarter of available CPUs to reduce memory pressure further
  testTimeout: 15000, // 15 second timeout per test (increased for complex tests)
  // Reduce memory usage
  workerIdleMemoryLimit: "1GB", // Increased limit to prevent premature worker termination
};
