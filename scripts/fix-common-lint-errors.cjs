#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing common lint errors...');

// Pattern fixes
const FIX_PATTERNS = {
  // Fix unused destructured variables from object destructuring
  unusedDestructured: {
    pattern: /const\s*{\s*([^}]+)\s*}\s*=\s*([^;]+);/g,
    fix: (match, vars, source, content, varName) => {
      // Check if the specific variable is used
      const varList = vars.split(',').map(v => v.trim());
      const usedVars = varList.filter(v => {
        const varParts = v.split(':');
        const name = varParts[0].trim();
        // Check if variable is used elsewhere in the file (excluding the destructuring line)
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        const allMatches = content.match(regex) || [];
        return allMatches.length > 1;
      });
      
      if (usedVars.length === 0) {
        // If no vars are used, remove the line
        return '';
      } else if (usedVars.length < varList.length) {
        // Some vars are unused
        return `const { ${usedVars.join(', ')} } = ${source};`;
      }
      return match;
    }
  },
  
  // Fix unused function parameters by prefixing with underscore
  unusedParams: {
    pattern: /(\w+)\s+is defined but never used\s+@typescript-eslint\/no-unused-vars/g,
    fix: (match, varName, content) => {
      // Only fix if it's a function parameter
      const functionPatterns = [
        new RegExp(`\\((\\s*[^)]*\\b${varName}\\b[^)]*)\\)\\s*=>`, 'g'),
        new RegExp(`\\((\\s*[^)]*\\b${varName}\\b[^)]*)\\)\\s*{`, 'g'),
        new RegExp(`function\\s+\\w+\\s*\\((\\s*[^)]*\\b${varName}\\b[^)]*)\\)`, 'g')
      ];
      
      let fixed = content;
      functionPatterns.forEach(pattern => {
        fixed = fixed.replace(pattern, (m, params) => {
          const newParams = params.replace(new RegExp(`\\b${varName}\\b`, 'g'), `_${varName}`);
          return m.replace(params, newParams);
        });
      });
      
      return fixed;
    }
  },
  
  // Fix parsing errors in JSX
  parsingErrors: {
    pattern: /Parsing error: Unexpected token\. Did you mean `{'>'}` or `&gt;`\?/g,
    fix: (match, content, line) => {
      // Find the problematic line
      const lines = content.split('\n');
      if (lines[line - 1] && lines[line - 1].includes('<<')) {
        lines[line - 1] = lines[line - 1].replace(/<</, '<');
      }
      return lines.join('\n');
    }
  },
  
  // Remove unused imports more aggressively
  removeUnusedImports: {
    pattern: /import\s+(?:type\s+)?{\s*([^}]+)\s*}\s+from\s+['"][^'"]+['"];?\s*$/gm,
    fix: (match, imports, content) => {
      const importList = imports.split(',').map(i => i.trim());
      const usedImports = importList.filter(imp => {
        const name = imp.split(' as ')[0].trim();
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        const allMatches = content.match(regex) || [];
        // Must be used more than once (not just in import)
        return allMatches.length > 1;
      });
      
      if (usedImports.length === 0) {
        return '';
      } else if (usedImports.length < importList.length) {
        return match.replace(`{ ${imports} }`, `{ ${usedImports.join(', ')} }`);
      }
      return match;
    }
  },
  
  // Fix specific case patterns
  fixSpecificPatterns: {
    pattern: null,
    fix: (content, filePath) => {
      // Fix InteractiveTreemap entries issue
      if (filePath.includes('InteractiveTreemap.tsx')) {
        content = content.replace(
          /const\s+{\s*data,\s*dimensions,\s*entries\s*}\s*=/,
          'const { data, dimensions } ='
        );
      }
      
      // Fix ActivityHeatmap entries issue
      if (filePath.includes('ActivityHeatmap.tsx')) {
        content = content.replace(
          /const\s+{\s*data,\s*dimensions,\s*entries\s*}\s*=/,
          'const { data, dimensions } ='
        );
      }
      
      // Fix InteractiveLineChart entries issue
      if (filePath.includes('InteractiveLineChart.tsx')) {
        content = content.replace(
          /const\s+{\s*data,\s*dimensions,\s*entries\s*}\s*=/,
          'const { data, dimensions } ='
        );
      }
      
      // Fix NetworkGraph entries issue
      if (filePath.includes('NetworkGraph.tsx')) {
        content = content.replace(
          /const\s+{\s*data,\s*dimensions,\s*entries,\s*selectedNode\s*}\s*=/,
          'const { data, dimensions, selectedNode } ='
        );
      }
      
      // Fix MapRenderer _center issue
      if (filePath.includes('MapRenderer.tsx')) {
        content = content.replace(
          /const\s+{\s*precintos,\s*_center,\s*onPrecintoClick\s*}\s*=/,
          'const { precintos, onPrecintoClick } ='
        );
      }
      
      // Fix InteractiveMap unused vars
      if (filePath.includes('InteractiveMap.tsx')) {
        content = content.replace(
          /const\s+{\s*_routes,\s*_center,\s*precintos[^}]*_mapType\s*}\s*=/,
          'const { precintos, showControls = true, height = "100%", onMarkerClick, selectedPrecinto } ='
        );
      }
      
      // Fix VirtualizedList parsing error
      if (filePath.includes('VirtualizedList.tsx')) {
        content = content.replace(
          /<<T,>>/g,
          '<T>'
        );
      }
      
      // Fix useWebSocket parsing error
      if (filePath.includes('useWebSocket.ts')) {
        // Find and fix the parsing error on line 84
        const lines = content.split('\n');
        if (lines[83]) { // Line 84 is index 83
          // Look for common parsing issues
          lines[83] = lines[83].replace(/^\s*}\s*$/, '  }');
        }
        content = lines.join('\n');
      }
      
      return content;
    }
  }
};

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;
    
    // Apply specific pattern fixes first
    if (FIX_PATTERNS.fixSpecificPatterns.fix) {
      const newContent = FIX_PATTERNS.fixSpecificPatterns.fix(content, filePath);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    }
    
    // Remove unused imports
    const importPattern = FIX_PATTERNS.removeUnusedImports.pattern;
    content = content.replace(importPattern, (match, imports) => {
      const result = FIX_PATTERNS.removeUnusedImports.fix(match, imports, content);
      if (result !== match) hasChanges = true;
      return result;
    });
    
    // Fix unused destructured variables
    const destructPattern = FIX_PATTERNS.unusedDestructured.pattern;
    content = content.replace(destructPattern, (match, vars, source) => {
      const result = FIX_PATTERNS.unusedDestructured.fix(match, vars, source, content);
      if (result !== match) hasChanges = true;
      return result;
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
});

console.log(`Found ${files.length} TypeScript files to check`);

let fixedCount = 0;
files.forEach(file => {
  if (processFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fixed ${fixedCount} files`);