#!/usr/bin/env node
"use strict";
/**
 * Generates an interactive HTML coverage report with expand/collapse functionality
 * Reads from coverage-summary.json and creates a single-page interactive report
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
exports.generateHTML = generateHTML;
exports.buildFileTree = buildFileTree;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getColorClass(percentage) {
  if (percentage >= 80) return "high";
  if (percentage >= 50) return "medium";
  if (percentage > 0) return "low";
  return "none";
}
function aggregateCoverage(children) {
  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalLines = 0;
  let coveredLines = 0;
  children.forEach(child => {
    const coverage = child.coverage || child.aggregatedCoverage;
    if (coverage) {
      totalStatements += coverage.statements.total;
      coveredStatements += coverage.statements.covered;
      totalBranches += coverage.branches.total;
      coveredBranches += coverage.branches.covered;
      totalFunctions += coverage.functions.total;
      coveredFunctions += coverage.functions.covered;
      totalLines += coverage.lines.total;
      coveredLines += coverage.lines.covered;
    }
  });
  return {
    statements: {
      total: totalStatements,
      covered: coveredStatements,
      skipped: 0,
      pct:
        totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0,
    },
    branches: {
      total: totalBranches,
      covered: coveredBranches,
      skipped: 0,
      pct: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0,
    },
    functions: {
      total: totalFunctions,
      covered: coveredFunctions,
      skipped: 0,
      pct: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0,
    },
    lines: {
      total: totalLines,
      covered: coveredLines,
      skipped: 0,
      pct: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0,
    },
  };
}
function buildFileTree(coverageData, rootPath) {
  const root = {
    name: "src",
    path: rootPath,
    isDirectory: true,
    children: [],
  };
  const cwd = process.cwd();
  Object.keys(coverageData).forEach(filePath => {
    if (filePath === "total") return;
    const fileData = coverageData[filePath];
    const relativePath = filePath.replace(cwd + "/", "").replace(cwd, "");
    const parts = relativePath.split("/").filter(p => p);
    // Skip if path doesn't start with 'src'
    if (parts[0] !== "src") return;
    // Remove 'src' from parts since root is already 'src'
    const pathParts = parts.slice(1);
    let current = root;
    let currentPath = rootPath;
    pathParts.forEach((part, index) => {
      const isLast = index === pathParts.length - 1;
      currentPath = path.join(currentPath, part);
      let child = current.children.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: currentPath,
          isDirectory: !isLast,
          children: [],
        };
        if (isLast) {
          child.coverage = fileData;
        }
        current.children.push(child);
      } else if (isLast) {
        // If child exists and this is the last part, update coverage
        child.coverage = fileData;
      }
      current = child;
    });
  });
  // Calculate aggregated coverage for all directories (bottom-up)
  function calculateAggregatedCoverage(node) {
    // First, process all children
    node.children.forEach(child => {
      if (child.isDirectory) {
        calculateAggregatedCoverage(child);
      }
    });
    // Then calculate aggregated coverage for this directory
    if (node.isDirectory && node.children.length > 0) {
      node.aggregatedCoverage = aggregateCoverage(node.children);
    }
  }
  calculateAggregatedCoverage(root);
  // Sort children: directories first, then files
  function sortNode(node) {
    node.children.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(child => {
      if (child.isDirectory) {
        sortNode(child);
      }
    });
  }
  sortNode(root);
  return root;
}
function renderNode(node, level = 0) {
  const indent = "  ".repeat(level);
  const hasChildren = node.children.length > 0;
  const isExpanded = level < 2; // Auto-expand first 2 levels
  let html = "";
  if (node.isDirectory) {
    const id = `dir-${node.path.replace(/[^a-zA-Z0-9]/g, "-")}`;
    const expandedClass = isExpanded ? "expanded" : "";
    const icon = hasChildren ? (isExpanded ? "📂" : "📁") : "📁";
    // Use aggregated coverage for directories
    const coverage = node.aggregatedCoverage;
    const stmtsPct = coverage?.statements.pct || 0;
    const branchPct = coverage?.branches.pct || 0;
    const funcsPct = coverage?.functions.pct || 0;
    const linesPct = coverage?.lines.pct || 0;
    const avgPct = coverage
      ? (stmtsPct + branchPct + funcsPct + linesPct) / 4
      : 0;
    const colorClass = getColorClass(avgPct);
    html += `${indent}<div class="directory ${expandedClass} ${colorClass}">\n`;
    html += `${indent}  <div class="dir-header" onclick="toggleDirectory('${id}')">\n`;
    html += `${indent}    <span class="toggle-icon">${isExpanded ? "▼" : "▶"}</span>\n`;
    html += `${indent}    <span class="dir-icon">${icon}</span>\n`;
    html += `${indent}    <span class="dir-name">${node.name}</span>\n`;
    if (coverage) {
      html += `${indent}    <div class="coverage-bars">\n`;
      html += `${indent}      <div class="coverage-bar" title="Statements: ${stmtsPct.toFixed(2)}%">\n`;
      html += `${indent}        <div class="bar-fill" style="width: ${stmtsPct}%; background-color: ${getColorClass(stmtsPct) === "high" ? "#27ae60" : getColorClass(stmtsPct) === "medium" ? "#f39c12" : "#e74c3c"};"></div>\n`;
      html += `${indent}        <span class="bar-label">${stmtsPct.toFixed(1)}%</span>\n`;
      html += `${indent}      </div>\n`;
      html += `${indent}    </div>\n`;
      html += `${indent}    <div class="coverage-details">\n`;
      html += `${indent}      <span class="coverage-stat">S: ${stmtsPct.toFixed(1)}%</span>\n`;
      html += `${indent}      <span class="coverage-stat">B: ${branchPct.toFixed(1)}%</span>\n`;
      html += `${indent}      <span class="coverage-stat">F: ${funcsPct.toFixed(1)}%</span>\n`;
      html += `${indent}      <span class="coverage-stat">L: ${linesPct.toFixed(1)}%</span>\n`;
      html += `${indent}    </div>\n`;
    }
    html += `${indent}  </div>\n`;
    html += `${indent}  <div class="dir-content" id="${id}" style="display: ${isExpanded ? "block" : "none"}">\n`;
    node.children.forEach(child => {
      html += renderNode(child, level + 1);
    });
    html += `${indent}  </div>\n`;
    html += `${indent}</div>\n`;
  } else {
    const coverage = node.coverage;
    if (!coverage) return "";
    const stmtsPct = coverage.statements.pct;
    const branchPct = coverage.branches.pct;
    const funcsPct = coverage.functions.pct;
    const linesPct = coverage.lines.pct;
    const avgPct = (stmtsPct + branchPct + funcsPct + linesPct) / 4;
    const colorClass = getColorClass(avgPct);
    html += `${indent}<div class="file ${colorClass}">\n`;
    html += `${indent}  <div class="file-header">\n`;
    html += `${indent}    <span class="file-icon">📄</span>\n`;
    html += `${indent}    <span class="file-name">${node.name}</span>\n`;
    html += `${indent}    <div class="coverage-bars">\n`;
    html += `${indent}      <div class="coverage-bar" title="Statements: ${stmtsPct.toFixed(2)}%">\n`;
    html += `${indent}        <div class="bar-fill" style="width: ${stmtsPct}%; background-color: ${getColorClass(stmtsPct) === "high" ? "#27ae60" : getColorClass(stmtsPct) === "medium" ? "#f39c12" : "#e74c3c"};"></div>\n`;
    html += `${indent}        <span class="bar-label">${stmtsPct.toFixed(1)}%</span>\n`;
    html += `${indent}      </div>\n`;
    html += `${indent}    </div>\n`;
    html += `${indent}    <div class="coverage-details">\n`;
    html += `${indent}      <span class="coverage-stat">S: ${stmtsPct.toFixed(1)}%</span>\n`;
    html += `${indent}      <span class="coverage-stat">B: ${branchPct.toFixed(1)}%</span>\n`;
    html += `${indent}      <span class="coverage-stat">F: ${funcsPct.toFixed(1)}%</span>\n`;
    html += `${indent}      <span class="coverage-stat">L: ${linesPct.toFixed(1)}%</span>\n`;
    html += `${indent}    </div>\n`;
    html += `${indent}  </div>\n`;
    html += `${indent}</div>\n`;
  }
  return html;
}
function generateHTML(coverageData) {
  const summary = coverageData.total;
  const fileTree = buildFileTree(coverageData, "src");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Coverage Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f6fa;
      color: #2f3542;
      padding: 20px;
      line-height: 1.6;
    }
    
    .header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    
    .header h1 {
      color: #2f3542;
      margin-bottom: 20px;
      font-size: 28px;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .summary-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #3498db;
    }
    
    .summary-item h3 {
      font-size: 14px;
      color: #57606f;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .summary-item .value {
      font-size: 32px;
      font-weight: bold;
      color: #2f3542;
    }
    
    .summary-item.high .value { color: #27ae60; }
    .summary-item.medium .value { color: #f39c12; }
    .summary-item.low .value { color: #e74c3c; }
    
    .tree-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .directory {
      margin: 4px 0;
    }
    
    .dir-header {
      padding: 8px 12px;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 4px;
      transition: background 0.2s;
      flex-wrap: wrap;
    }
    
    .dir-header:hover {
      background: #f8f9fa;
    }
    
    .toggle-icon {
      width: 16px;
      font-size: 12px;
      color: #57606f;
    }
    
    .dir-icon, .file-icon {
      font-size: 16px;
    }
    
    .dir-name {
      font-weight: 600;
      color: #2f3542;
      flex: 1;
    }
    
    .dir-coverage {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #57606f;
      margin-left: auto;
    }
    
    .directory.high { border-left: 3px solid #27ae60; }
    .directory.medium { border-left: 3px solid #f39c12; }
    .directory.low { border-left: 3px solid #e74c3c; }
    .directory.none { border-left: 3px solid #95a5a6; }
    
    .dir-content {
      margin-left: 24px;
      border-left: 2px solid #dfe4ea;
      padding-left: 12px;
    }
    
    .file {
      margin: 2px 0;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .file:hover {
      background: #f8f9fa;
    }
    
    .file-header {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .file-name {
      flex: 1;
      min-width: 200px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      color: #2f3542;
    }
    
    .coverage-bars {
      display: flex;
      gap: 8px;
      min-width: 150px;
    }
    
    .coverage-bar {
      position: relative;
      width: 100px;
      height: 20px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .bar-fill {
      height: 100%;
      transition: width 0.3s;
    }
    
    .bar-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 10px;
      font-weight: bold;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      z-index: 1;
    }
    
    .coverage-details {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #57606f;
    }
    
    .coverage-stat {
      font-family: 'Monaco', 'Courier New', monospace;
    }
    
    .file.high { border-left: 3px solid #27ae60; }
    .file.medium { border-left: 3px solid #f39c12; }
    .file.low { border-left: 3px solid #e74c3c; }
    .file.none { border-left: 3px solid #95a5a6; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Code Coverage Report</h1>
    <div class="summary">
      <div class="summary-item ${getColorClass(summary.statements.pct)}">
        <h3>Statements</h3>
        <div class="value">${summary.statements.pct.toFixed(2)}%</div>
        <div style="font-size: 12px; color: #57606f; margin-top: 4px;">
          ${summary.statements.covered} / ${summary.statements.total}
        </div>
      </div>
      <div class="summary-item ${getColorClass(summary.branches.pct)}">
        <h3>Branches</h3>
        <div class="value">${summary.branches.pct.toFixed(2)}%</div>
        <div style="font-size: 12px; color: #57606f; margin-top: 4px;">
          ${summary.branches.covered} / ${summary.branches.total}
        </div>
      </div>
      <div class="summary-item ${getColorClass(summary.functions.pct)}">
        <h3>Functions</h3>
        <div class="value">${summary.functions.pct.toFixed(2)}%</div>
        <div style="font-size: 12px; color: #57606f; margin-top: 4px;">
          ${summary.functions.covered} / ${summary.functions.total}
        </div>
      </div>
      <div class="summary-item ${getColorClass(summary.lines.pct)}">
        <h3>Lines</h3>
        <div class="value">${summary.lines.pct.toFixed(2)}%</div>
        <div style="font-size: 12px; color: #57606f; margin-top: 4px;">
          ${summary.lines.covered} / ${summary.lines.total}
        </div>
      </div>
    </div>
  </div>
  
  <div class="tree-container">
    <h2 style="margin-bottom: 16px; color: #2f3542;">File Coverage</h2>
    ${renderNode(fileTree)}
  </div>
  
  <script>
    function toggleDirectory(id) {
      const content = document.getElementById(id);
      const header = content.previousElementSibling;
      const toggleIcon = header.querySelector('.toggle-icon');
      const dirIcon = header.querySelector('.dir-icon');
      
      if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleIcon.textContent = '▼';
        dirIcon.textContent = '📂';
        header.parentElement.classList.add('expanded');
      } else {
        content.style.display = 'none';
        toggleIcon.textContent = '▶';
        dirIcon.textContent = '📁';
        header.parentElement.classList.remove('expanded');
      }
    }
  </script>
</body>
</html>`;
}
// Main execution
if (require.main === module) {
  const coveragePath = path.join(
    process.cwd(),
    "coverage",
    "coverage-summary.json"
  );
  const outputPath = path.join(
    process.cwd(),
    "coverage",
    "coverage-interactive.html"
  );
  if (!fs.existsSync(coveragePath)) {
    console.error("Coverage summary not found. Run: yarn test --coverage");
    process.exit(1);
  }
  try {
    const fileContent = fs.readFileSync(coveragePath, "utf8");
    const coverageData = JSON.parse(fileContent);
    const html = generateHTML(coverageData);
    fs.writeFileSync(outputPath, html, "utf8");
    console.log(`✅ Interactive coverage report generated: ${outputPath}`);
    console.log(`   Open in browser: open ${outputPath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error generating report: ${errorMessage}`);
    process.exit(1);
  }
}
