const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Critical fixes for specific known issues
const criticalFixes = [
  {
    file: 'src/store/createStore.ts',
    fixes: [
      { from: 'enableImmerOption', to: 'enableImmer' },
      { from: 'enableLoggerOption', to: 'enableLogger' }
    ]
  },
  {
    file: 'src/utils/export.ts',
    pattern: /\bdata\b/g,
    contextCheck: (content) => content.includes('_data'),
    fixes: [
      { from: /\bdata\b/g, to: '_data' }
    ]
  }
];

// Function to apply critical fixes
async function applyCriticalFixes() {
  console.log('Applying critical fixes...\n');
  
  for (const fix of criticalFixes) {
    const filePath = fix.file;
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        continue;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Apply context check if provided
      if (fix.contextCheck && !fix.contextCheck(content)) {
        continue;
      }
      
      // Apply fixes
      fix.fixes.forEach(({ from, to }) => {
        const regex = typeof from === 'string' ? new RegExp(`\\b${from}\\b`, 'g') : from;
        const newContent = content.replace(regex, to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          console.log(`  Fixed in ${filePath}: ${from} → ${to}`);
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
}

// Function to find and fix common underscore mismatches
async function fixUnderscoreMismatches() {
  console.log('\nFixing underscore mismatches...\n');
  
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '**/*.test.{ts,tsx}']
  });
  
  let totalFixed = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let newContent = content;
      let modified = false;
      
      // Pattern: Fix variable references in conditionals
      const patterns = [
        {
          // if (_error) when error is defined
          search: /if\s*\(\s*_error\s*\)/g,
          replace: 'if (error)',
          condition: (content) => content.includes('const {error') || content.includes('let error') || content.includes('var error')
        },
        {
          // if (_data) when data is defined  
          search: /if\s*\(\s*_data\s*\)/g,
          replace: 'if (data)',
          condition: (content) => content.includes('const {data') || content.includes('let data') || content.includes('var data')
        },
        {
          // if (_loading) when loading is defined
          search: /if\s*\(\s*_loading\s*\)/g,
          replace: 'if (loading)',
          condition: (content) => content.includes('const {loading') || content.includes('let loading') || content.includes('var loading')
        },
        {
          // throw error when _error is in catch
          search: /catch\s*\(\s*_error\s*\)\s*\{[\s\S]*?throw\s+error/g,
          replace: (match) => match.replace('throw error', 'throw _error'),
          condition: () => true
        }
      ];
      
      patterns.forEach(({ search, replace, condition }) => {
        if (condition(content)) {
          const result = typeof replace === 'function' 
            ? newContent.replace(search, replace)
            : newContent.replace(search, replace);
            
          if (result !== newContent) {
            newContent = result;
            modified = true;
          }
        }
      });
      
      // Fix template literal references
      const templateVarPattern = /\$\{(\w+)\}/g;
      let match;
      const replacements = [];
      
      while ((match = templateVarPattern.exec(content)) !== null) {
        const varName = match[1];
        const underscoredVar = '_' + varName;
        
        // Check if underscored version exists but non-underscored doesn't
        if (content.includes(`const {${underscoredVar}`) || 
            content.includes(`let ${underscoredVar}`) ||
            content.includes(`var ${underscoredVar}`)) {
          if (!content.includes(`const ${varName}`) && 
              !content.includes(`let ${varName}`) && 
              !content.includes(`var ${varName}`)) {
            replacements.push({ from: `\${${varName}}`, to: `\${${underscoredVar}}` });
          }
        }
      }
      
      replacements.forEach(({ from, to }) => {
        newContent = newContent.replace(from, to);
        modified = true;
      });
      
      if (modified) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Fixed: ${file}`);
        totalFixed++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\nTotal files fixed: ${totalFixed}`);
}

// Main function
async function main() {
  await applyCriticalFixes();
  await fixUnderscoreMismatches();
  
  console.log('\nFix process completed!');
}

main().catch(console.error);