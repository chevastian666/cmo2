const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common parsing error patterns and fixes
const PARSING_FIXES = [
  // Remove single semicolons on their own lines
  { pattern: /^\s*;\s*$/gm, replacement: '' },
  
  // Fix parsing errors with properties
  { pattern: /;\s*$/gm, replacement: '' },
  
  // Fix comma issues in type definitions
  { pattern: /,\s*;/g, replacement: ';' },
  
  // Fix missing opening braces
  { pattern: /interface\s+\w+\s*\{;/g, replacement: (match) => match.replace(';', '') },
  
  // Fix trailing semicolons in interface/type definitions
  { pattern: /(interface\s+\w+[^{]*\{[^}]*);(\s*\})/g, replacement: '$1$2' },
  
  // Fix object property syntax errors
  { pattern: /(\w+):\s*\{;/g, replacement: '$1: {' },
  
  // Fix function parameter syntax
  { pattern: /\(\s*\{;/g, replacement: '({' },
  
  // Fix arrow function syntax
  { pattern: /=>\s*\{;/g, replacement: '=> {' },
  
  // Fix array syntax
  { pattern: /\[\s*\{;/g, replacement: '[{' },
  
  // Fix switch case syntax
  { pattern: /case\s+[^:]+:\s*\{;/g, replacement: (match) => match.replace(';', '') },
  
  // Fix property definitions in interfaces
  { pattern: /^\s*(\w+)\s*:\s*([^;]+);;\s*$/gm, replacement: '  $1: $2;' },
  
  // Fix empty statements
  { pattern: /\{\s*;\s*\}/g, replacement: '{}' },
  
  // Fix destructuring syntax
  { pattern: /\{\s*;([^}]*)\}/g, replacement: '{$1}' },
  
  // Fix React component props
  { pattern: /React\.FC<\{;/g, replacement: 'React.FC<{' },
  
  // Fix generic type syntax
  { pattern: /<\{;/g, replacement: '<{' },
  
  // Fix array of objects
  { pattern: /\[\s*\{;/g, replacement: '[{' },
  
  // Fix function calls with object parameters
  { pattern: /\(\s*\{;/g, replacement: '({' },
  
  // Fix ternary operator syntax
  { pattern: /\?\s*\{;/g, replacement: '? {' },
  
  // Fix JSX prop syntax
  { pattern: /=\s*\{;/g, replacement: '={' },
];

// Additional specific fixes for common patterns
const SPECIFIC_FIXES = [
  // Fix missing closing braces
  { pattern: /case\s+['"]([^'"]+)['"]:\s*\{([^}]*)\n\s*break;\s*$/gm, replacement: 'case "$1": {\n$2\n  break;\n}' },
  
  // Fix switch statement blocks
  { pattern: /switch\s*\([^)]+\)\s*\{([^}]*)\n\s*\}/gm, replacement: (match) => {
    // Ensure proper case block formatting
    return match.replace(/case\s+([^:]+):\s*([^b])/g, 'case $1: {\n  $2');
  }},
  
  // Fix object literals in return statements
  { pattern: /return\s*\{;/g, replacement: 'return {' },
  
  // Fix useState hooks
  { pattern: /useState\s*\(\s*\{;/g, replacement: 'useState({' },
  
  // Fix useEffect dependencies
  { pattern: /\],\s*\[;/g, replacement: '], [' },
  
  // Fix imports with syntax errors
  { pattern: /import\s*\{;/g, replacement: 'import {' },
  
  // Fix exports with syntax errors
  { pattern: /export\s*\{;/g, replacement: 'export {' },
  
  // Fix type assertions
  { pattern: /as\s*\{;/g, replacement: 'as {' },
  
  // Fix spread operator
  { pattern: /\.\.\.\s*\{;/g, replacement: '...{' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply all parsing fixes
    [...PARSING_FIXES, ...SPECIFIC_FIXES].forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    // Remove consecutive empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Fix indentation issues
    content = content.replace(/^\s*;\s*$/gm, '');
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findTSFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results.push(...findTSFiles(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Main execution
console.log('🔧 Fixing all parsing errors...');

const srcDir = path.join(__dirname, '..', 'src');
const files = findTSFiles(srcDir);

let fixedFiles = 0;
for (const file of files) {
  if (fixFile(file)) {
    fixedFiles++;
    console.log(`✅ Fixed: ${path.relative(srcDir, file)}`);
  }
}

console.log(`\n🎉 Fixed ${fixedFiles} files with parsing errors`);

// Run ESLint autofix
console.log('\n🔧 Running ESLint autofix...');
try {
  execSync('npm run lint -- --fix', { stdio: 'inherit' });
} catch (error) {
  console.log('ESLint autofix completed with some remaining issues');
}

console.log('\n✅ Parsing error fixes completed!');