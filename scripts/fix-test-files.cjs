#!/usr/bin/env node
/**
 * Fix test files and mock handlers
 */

const fs = require('fs');

console.log('🔧 Fixing test files and mock handlers...');

// Fix test/setup.ts
const setupPath = 'src/test/setup.ts';
if (fs.existsSync(setupPath)) {
  let content = fs.readFileSync(setupPath, 'utf8');
  
  // Fix the _keys and _store issues
  content = content.replace(
    /const keys = Object\.keys\(_store\)/g,
    'const keys = Object.keys(store)'
  );
  content = content.replace(
    /return Object\.keys\(_store\)\.length/g,
    'return Object.keys(store).length'
  );
  content = content.replace(
    /const _keys = Object\.keys\(_store\)/g,
    'const keys = Object.keys(store)'
  );
  
  fs.writeFileSync(setupPath, content);
  console.log('✅ Fixed test/setup.ts');
}

// Fix test/utils/test-utils.tsx
const testUtilsPath = 'src/test/utils/test-utils.tsx';
if (fs.existsSync(testUtilsPath)) {
  let content = fs.readFileSync(testUtilsPath, 'utf8');
  
  // Remove unused variables by adding underscore prefix
  content = content.replace(/const (_\w+) = /g, '// const $1 = ');
  content = content.replace(/export\s+(function|const)\s+data\s*[({]/g, '// export $1 data$2');
  
  fs.writeFileSync(testUtilsPath, content);
  console.log('✅ Fixed test/utils/test-utils.tsx');
}

// Fix test/mocks/handlers.ts
const handlersPath = 'src/test/mocks/handlers.ts';
if (fs.existsSync(handlersPath)) {
  let content = fs.readFileSync(handlersPath, 'utf8');
  
  // Comment out unused mock functions and variables
  content = content.replace(/const (_\w+) = /g, '// const $1 = ');
  content = content.replace(/const (_\w+):/g, '// const $1:');
  
  fs.writeFileSync(handlersPath, content);
  console.log('✅ Fixed test/mocks/handlers.ts');
}

console.log('✅ Test file fixes completed!');