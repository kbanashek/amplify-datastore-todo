#!/usr/bin/env node

/**
 * Script to automatically add JSDoc documentation to React components
 * that don't already have comprehensive documentation.
 */

const fs = require("fs");
const path = require("path");

/**
 * Check if a file already has JSDoc for the main export
 * @param {string} content - File content
 * @returns {boolean} True if JSDoc found for main export
 */
function hasMainExportJSDoc(content) {
  // Check if there's a JSDoc comment before export const or export function
  const exportPattern =
    /\/\*\*[\s\S]*?\*\/\s*export\s+(const|function|class|interface)\s+\w+/;
  return exportPattern.test(content);
}

/**
 * Extract component name from file
 * @param {string} content - File content
 * @returns {string|null} Component name or null
 */
function getComponentName(content) {
  // Match: export const ComponentName or export function ComponentName
  const match = content.match(/export\s+(?:const|function)\s+(\w+)/);
  return match ? match[1] : null;
}

/**
 * Extract interface name from props
 * @param {string} content - File content
 * @returns {string|null} Interface name or null
 */
function getPropsInterfaceName(content) {
  const match = content.match(/interface\s+(\w+Props)/);
  return match ? match[1] : null;
}

/**
 * Generate JSDoc for a component
 * @param {string} componentName - Name of the component
 * @param {string} propsInterface - Name of the props interface
 * @returns {string} Generated JSDoc
 */
function generateComponentJSDoc(componentName, propsInterface) {
  return `/**
 * ${componentName} component.
 * 
 * @param props - Component props
 * @returns Rendered ${componentName} component
 */
`;
}

/**
 * Generate module-level JSDoc
 * @param {string} componentName - Name of the component
 * @returns {string} Generated module JSDoc
 */
function generateModuleJSDoc(componentName) {
  return `/**
 * ${componentName} component module.
 * 
 * @module ${componentName}
 */

`;
}

/**
 * Add JSDoc to a component file
 * @param {string} filePath - Path to the file
 */
function addJSDocToFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Skip if already has comprehensive JSDoc
  if (hasMainExportJSDoc(content)) {
    console.log(`✓ Skipping ${path.basename(filePath)} (already documented)`);
    return false;
  }

  const componentName = getComponentName(content);
  if (!componentName) {
    console.log(`? Skipping ${path.basename(filePath)} (no component found)`);
    return false;
  }

  const propsInterface = getPropsInterfaceName(content);

  // Add module-level JSDoc at the top (after any existing comments)
  let newContent = content;

  // Check if file starts with import statements
  const importMatch = content.match(/^((?:\/\/.*\n)*)(import .+)/);
  if (importMatch) {
    // Insert module JSDoc before first import
    const moduleJSDoc = generateModuleJSDoc(componentName);
    newContent = newContent.replace(
      /^((?:\/\/.*\n)*)import/,
      `$1${moduleJSDoc}import`
    );
  }

  // Add component JSDoc before the main export
  const componentJSDoc = generateComponentJSDoc(componentName, propsInterface);
  const exportPattern = new RegExp(
    `(export\\s+(?:const|function)\\s+${componentName})`,
    "m"
  );
  newContent = newContent.replace(exportPattern, `${componentJSDoc}$1`);

  // Add props interface JSDoc if exists and not documented
  if (propsInterface && !content.includes(`/**\n * Props for`)) {
    const interfaceJSDoc = `/**
 * Props for the ${componentName} component
 */
`;
    const interfacePattern = new RegExp(
      `(interface\\s+${propsInterface})`,
      "m"
    );
    newContent = newContent.replace(interfacePattern, `${interfaceJSDoc}$1`);
  }

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, "utf-8");
    console.log(`✓ Added JSDoc to ${path.basename(filePath)}`);
    return true;
  }

  return false;
}

/**
 * Main function
 */
function main() {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.log("Usage: node add-jsdoc.js <file1> <file2> ...");
    process.exit(1);
  }

  let modified = 0;

  files.forEach(file => {
    if (fs.existsSync(file)) {
      if (addJSDocToFile(file)) {
        modified++;
      }
    } else {
      console.log(`✗ File not found: ${file}`);
    }
  });

  console.log(`\n✓ Modified ${modified} file(s)`);
}

main();
