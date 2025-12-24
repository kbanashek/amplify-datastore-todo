#!/usr/bin/env node
/**
 * Convert relative imports to path aliases in @orion/task-system package.
 *
 * This script migrates relative import paths (e.g., `../../services/TaskService`)
 * to path aliases (e.g., `@services/TaskService`) for better readability and maintainability.
 *
 * @example
 * // Dry run - show what would change without modifying files
 * node scripts/convert-imports.js --dry-run
 *
 * @example
 * // Apply changes
 * node scripts/convert-imports.js
 *
 * @see {@link file://.cursor/rules/code-style.mdc} for path alias conventions
 */

const fs = require("fs");
const path = require("path");

/** @type {string} Source directory to process */
const SRC_DIR = path.join(__dirname, "../packages/task-system/src");

/** @type {boolean} Whether to run in dry-run mode (no file modifications) */
const DRY_RUN = process.argv.includes("--dry-run");

/**
 * Mapping of directory names to their corresponding path aliases.
 * @type {Record<string, string>}
 */
const ALIASES = {
  components: "@components",
  hooks: "@hooks",
  services: "@services",
  utils: "@utils",
  types: "@task-types",
  constants: "@constants",
  contexts: "@contexts",
  translations: "@translations",
  models: "@models",
  screens: "@screens",
  fixtures: "@fixtures",
  runtime: "@runtime",
};

/**
 * Recursively walks a directory and invokes a callback for each TypeScript file.
 *
 * @param {string} dir - The directory path to walk
 * @param {(filePath: string) => void} callback - Function to call for each .ts/.tsx file
 * @returns {void}
 */
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const filePath = path.join(dir, f);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (/\.(ts|tsx)$/.test(f)) {
      callback(filePath);
    }
  });
}

/**
 * Converts a relative import path to a path alias.
 *
 * @param {string} importPath - The relative import path (e.g., "../../services/TaskService")
 * @param {string} fromFile - The absolute path of the file containing the import
 * @returns {string} The converted alias path (e.g., "@services/TaskService") or original if no conversion
 *
 * @example
 * // From packages/task-system/src/hooks/__tests__/useTask.test.ts
 * convertImport("../../services/TaskService", "/path/to/useTask.test.ts")
 * // Returns: "@services/TaskService"
 */
function convertImport(importPath, fromFile) {
  // Skip non-relative imports
  if (!importPath.startsWith(".")) {
    return importPath;
  }

  // Resolve the full path
  const fromDir = path.dirname(fromFile);
  const resolvedPath = path.resolve(fromDir, importPath);
  const relativeToPkg = path.relative(SRC_DIR, resolvedPath);

  // Check if it starts with a known alias directory
  for (const [dir, alias] of Object.entries(ALIASES)) {
    if (relativeToPkg.startsWith(dir + "/") || relativeToPkg === dir) {
      const rest = relativeToPkg.slice(dir.length);
      const newPath = alias + (rest || "/index");
      return newPath;
    }
  }

  // Special case: if within same top-level directory, keep relative
  const fromRelative = path.relative(SRC_DIR, fromDir);
  const fromTopDir = fromRelative.split("/")[0];
  const toTopDir = relativeToPkg.split("/")[0];

  if (fromTopDir === toTopDir && ALIASES[toTopDir]) {
    // Convert to alias anyway for consistency
    const alias = ALIASES[toTopDir];
    return alias + "/" + relativeToPkg.slice(toTopDir.length + 1);
  }

  // Keep as-is if can't convert
  return importPath;
}

/**
 * Processes a single TypeScript file, converting relative imports to path aliases.
 *
 * Handles both ES module imports (`import ... from "..."`) and Jest mocks (`jest.mock("...")`).
 *
 * @param {string} filePath - Absolute path to the file to process
 * @returns {number} The number of imports that were converted
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let modified = content;
  let changeCount = 0;

  // Match import statements: import ... from "..."
  // and jest.mock("...")
  const importRegex = /(from\s+["'])(\.[^"']+)(["'])/g;
  const mockRegex = /(jest\.mock\(["'])(\.[^"']+)(["'])/g;

  modified = modified.replace(
    importRegex,
    (match, prefix, importPath, suffix) => {
      const newPath = convertImport(importPath, filePath);
      if (newPath !== importPath) {
        changeCount++;
        return prefix + newPath + suffix;
      }
      return match;
    }
  );

  modified = modified.replace(
    mockRegex,
    (match, prefix, importPath, suffix) => {
      const newPath = convertImport(importPath, filePath);
      if (newPath !== importPath) {
        changeCount++;
        return prefix + newPath + suffix;
      }
      return match;
    }
  );

  if (changeCount > 0) {
    const relPath = path.relative(process.cwd(), filePath);
    console.log(
      `${DRY_RUN ? "[DRY RUN] " : ""}${relPath}: ${changeCount} imports converted`
    );
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, modified);
    }
  }

  return changeCount;
}

// Main
console.log(`Converting imports in ${SRC_DIR}`);
console.log(DRY_RUN ? "DRY RUN MODE - no files will be modified\n" : "\n");

let totalChanges = 0;
let fileCount = 0;

walkDir(SRC_DIR, filePath => {
  const changes = processFile(filePath);
  if (changes > 0) {
    totalChanges += changes;
    fileCount++;
  }
});

console.log(
  `\n${DRY_RUN ? "[DRY RUN] " : ""}Total: ${totalChanges} imports converted in ${fileCount} files`
);
