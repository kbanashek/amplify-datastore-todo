// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [projectRoot];

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

// Ensure Metro can resolve workspace packages
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), "json"];

// Exclude docs and test files from bundling
config.resolver.blockList = [
  // Exclude docs directory (contains examples and integration resources)
  /packages\/task-system\/docs\/.*/,
  // Exclude all test files
  /.*\/__tests__\/.*/,
  /.*\.test\.(ts|tsx|js|jsx)$/,
  /.*\.spec\.(ts|tsx|js|jsx)$/,
];

module.exports = config;
