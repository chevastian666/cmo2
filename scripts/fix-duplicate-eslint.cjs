#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing duplicate eslint-disable comments...');

// Pattern to fix duplicate eslint-disable comments
const fixDuplicateEslintComments = (content) => {
  // Remove duplicate consecutive eslint-disable-next-line comments
  content = content.replace(
    /(\s*\/\/\s*eslint-disable-next-line[^\n]*\n\s*)+\/\/\s*eslint-disable-next-line[^\n]*/g,
    '\n  // eslint-disable-next-line react-hooks/exhaustive-deps'
  );
  
  // Remove eslint-disable-next-line without specific rule
  content = content.replace(
    /\/\/\s*eslint-disable-next-line\s*\n/g,
    ''
  );
  
  return content;
};

// Get all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
});

let fixedCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes
    content = fixDuplicateEslintComments(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files`);