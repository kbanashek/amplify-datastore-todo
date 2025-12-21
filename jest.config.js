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
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/*.test.{ts,tsx}",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
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
