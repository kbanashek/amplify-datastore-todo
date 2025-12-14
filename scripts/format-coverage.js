#!/usr/bin/env node
"use strict";
/**
 * Formats Jest coverage report for better readability
 * Groups files by directory and highlights coverage levels
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCoverageReport = formatCoverageReport;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};
function getColorForCoverage(percentage) {
  if (percentage >= 80) return colors.green;
  if (percentage >= 50) return colors.yellow;
  if (percentage > 0) return colors.red;
  return colors.dim;
}
function formatPercentage(value, width = 6) {
  const color = getColorForCoverage(value);
  const formatted = value.toFixed(2).padStart(width);
  return `${color}${formatted}%${colors.reset}`;
}
function formatCoverageReport(coverageData) {
  const lines = [];
  // Header
  lines.push("\n" + "=".repeat(100));
  lines.push(`${colors.bright}${colors.cyan}COVERAGE REPORT${colors.reset}`);
  lines.push("=".repeat(100) + "\n");
  // Summary
  const summary = coverageData.total;
  lines.push(`${colors.bright}Overall Coverage:${colors.reset}`);
  lines.push(
    `  Statements: ${formatPercentage(summary.statements.pct)} (${summary.statements.covered}/${summary.statements.total})`
  );
  lines.push(
    `  Branches:   ${formatPercentage(summary.branches.pct)} (${summary.branches.covered}/${summary.branches.total})`
  );
  lines.push(
    `  Functions:  ${formatPercentage(summary.functions.pct)} (${summary.functions.covered}/${summary.functions.total})`
  );
  lines.push(
    `  Lines:      ${formatPercentage(summary.lines.pct)} (${summary.lines.covered}/${summary.lines.total})`
  );
  lines.push("");
  // Group files by directory
  const byDirectory = {};
  const cwd = process.cwd();
  Object.keys(coverageData).forEach(filePath => {
    // Skip total key
    if (filePath === "total") return;
    const fileData = coverageData[filePath];
    const relativePath = filePath.replace(cwd + "/", "").replace(cwd, "");
    const dir = path.dirname(relativePath) || ".";
    if (!byDirectory[dir]) {
      byDirectory[dir] = [];
    }
    byDirectory[dir].push({
      path: relativePath,
      data: fileData,
    });
  });
  // Sort directories
  const sortedDirs = Object.keys(byDirectory).sort();
  // Print by directory
  sortedDirs.forEach(dir => {
    lines.push(`${colors.bright}${colors.blue}📁 ${dir}${colors.reset}`);
    lines.push("-".repeat(100));
    const files = byDirectory[dir].sort((a, b) =>
      path.basename(a.path).localeCompare(path.basename(b.path))
    );
    files.forEach(({ path: filePath, data }) => {
      const fileName = path.basename(filePath);
      const stmts = formatPercentage(data.statements.pct);
      const branch = formatPercentage(data.branches.pct);
      const funcs = formatPercentage(data.functions.pct);
      const linesCov = formatPercentage(data.lines.pct);
      // Calculate uncovered lines (simplified - would need full coverage data for exact lines)
      const uncoveredCount = data.lines.total - data.lines.covered;
      const uncoveredStr =
        uncoveredCount > 0
          ? ` ${colors.dim}(${uncoveredCount} lines uncovered)${colors.reset}`
          : "";
      lines.push(
        `  ${fileName.padEnd(40)} ${stmts} ${branch} ${funcs} ${linesCov}${uncoveredStr}`
      );
    });
    lines.push("");
  });
  // Footer
  lines.push("=".repeat(100));
  lines.push(
    `${colors.dim}Legend: ${colors.green}≥80%${colors.reset} ${colors.dim}| ${colors.yellow}50-79%${colors.reset} ${colors.dim}| ${colors.red}<50%${colors.reset} ${colors.dim}| ${colors.dim}0%${colors.reset}`
  );
  lines.push("=".repeat(100) + "\n");
  return lines.join("\n");
}
// If running as script, read coverage data from file
if (require.main === module) {
  const coveragePath = path.join(
    process.cwd(),
    "coverage",
    "coverage-summary.json"
  );
  if (fs.existsSync(coveragePath)) {
    try {
      const fileContent = fs.readFileSync(coveragePath, "utf8");
      const coverageData = JSON.parse(fileContent);
      console.log(formatCoverageReport(coverageData));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error reading coverage file: ${errorMessage}`);
      process.exit(1);
    }
  } else {
    console.error("Coverage summary not found. Run: yarn test --coverage");
    process.exit(1);
  }
}
