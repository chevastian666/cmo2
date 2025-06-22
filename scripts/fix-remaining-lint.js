#!/usr/bin/env node

/**
 * Fix remaining lint errors - enhanced version
 * By Cheva
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

// Enhanced patterns for fixing
const FIX_PATTERNS = {
  // Remove unused destructured variables
  unusedDestructured: {
    pattern: /const\s*{\s*([^}]+)\s*}\s*=\s*([^;]+);/g,
    fix: (match, vars, source) => {
      const varList = vars.split(',').map(v => v.trim());
      const usedVars = [];
      const content = match;
      
      // Check if each variable is used (simple check)
      varList.forEach(v => {
        const varName = v.split(':')[0].trim();
        if (varName.startsWith('_') || content.includes(`${varName}:`)) {
          usedVars.push(v);
        }
      });
      
      if (usedVars.length === 0) {
        return ''; // Remove entire destructuring
      } else if (usedVars.length < varList.length) {
        return `const { ${usedVars.join(', ')} } = ${source};`;
      }
      return match;
    },
    description: 'Remove unused destructured variables'
  },

  // Remove standalone unused variables
  unusedStandalone: {
    pattern: /^\s*(?:const|let|var)\s+_\w+\s*=\s*[^;]+;\s*$/gm,
    fix: () => '',
    description: 'Remove unused standalone variables'
  },

  // Fix unused function parameters
  unusedParams: {
    pattern: /\(([^)]+)\)\s*(?:=>|{)/g,
    fix: (match, params) => {
      const paramList = params.split(',').map(p => p.trim());
      const fixedParams = paramList.map((param, index) => {
        // If it's the last parameter and starts with _, keep it
        if (param.startsWith('_')) return param;
        // If it's not the last and unused, replace with _
        if (index < paramList.length - 1 && !param.startsWith('_')) {
          // This is a simple heuristic, might need refinement
          return param;
        }
        return param;
      });
      return `(${fixedParams.join(', ')})${match.slice(match.indexOf(')') + 1)}`;
    },
    description: 'Fix unused function parameters'
  },

  // Replace remaining any types with specific types
  anyToSpecificTypes: {
    pattern: /:\s*any\[\]/g,
    fix: ': unknown[]',
    description: 'Replace any[] with unknown[]'
  },

  // Fix Record<string, any>
  recordAnyFix: {
    pattern: /Record<string,\s*any>/g,
    fix: 'Record<string, unknown>',
    description: 'Replace Record<string, any> with Record<string, unknown>'
  },

  // Remove unused imports more aggressively
  unusedImportsAggressive: {
    pattern: /^import\s+(?:type\s+)?{\s*([^}]+)\s*}\s+from\s+['"][^'"]+['"];?\s*$/gm,
    fix: (match, imports, file, content) => {
      const importList = imports.split(',').map(i => i.trim());
      const cleanedList = [];
      
      for (const imp of importList) {
        const importName = imp.split(' as ')[0].trim();
        // Count occurrences (excluding the import line itself)
        const contentWithoutImport = content.replace(match, '');
        const regex = new RegExp(`\\b${importName}\\b`, 'g');
        const matches = contentWithoutImport.match(regex);
        
        if (matches && matches.length > 0) {
          cleanedList.push(imp);
        }
      }
      
      if (cleanedList.length === 0) {
        return ''; // Remove entire import
      }
      return match.replace(imports, cleanedList.join(', '));
    },
    description: 'Remove unused imports aggressively'
  }
};

async function fixFile(filePath, dryRun = false) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const originalContent = content;
    const changes = [];

    // Apply fixes
    for (const [name, pattern] of Object.entries(FIX_PATTERNS)) {
      let newContent = content;
      
      if (pattern.fix.length >= 3) {
        // Fix function with parameters
        newContent = content.replace(pattern.pattern, (...args) => {
          return pattern.fix(...args, filePath, content);
        });
      } else {
        // Simple replacement
        newContent = content.replace(pattern.pattern, pattern.fix);
      }
      
      if (newContent !== content) {
        changes.push(pattern.description);
        content = newContent;
      }
    }

    // Additional specific fixes
    content = applySpecificFixes(content, filePath, changes);

    if (content !== originalContent) {
      if (!dryRun) {
        await fs.writeFile(filePath, content);
      }
      return { file: filePath, changes, success: true };
    }

    return { file: filePath, changes: [], success: false };
  } catch (error) {
    return { file: filePath, error: error.message };
  }
}

function applySpecificFixes(content, filePath, changes) {
  // Fix specific known issues
  const fileName = path.basename(filePath);
  
  // SankeyChart.tsx specific fixes
  if (fileName === 'SankeyChart.tsx') {
    if (content.includes('_N') && !content.includes('// @ts-expect-error')) {
      content = content.replace(
        /\.nodeId\((?:d:\s*any\s*=>\s*d\.)?_N\)/,
        '.nodeId((d: any) => d.name)'
      );
      changes.push('Fixed _N usage in SankeyChart');
    }
    if (content.includes('_L')) {
      content = content.replace(
        /\.linkSort\((?:\(a:\s*any,\s*b:\s*any\)\s*=>\s*b\.)?_L/,
        '.linkSort((a: any, b: any) => b.value'
      );
      changes.push('Fixed _L usage in SankeyChart');
    }
  }

  // Remove setters that are never used
  if (content.includes('const [') && content.includes(', set')) {
    const setterRegex = /const\s+\[\s*(\w+)\s*,\s*(set\w+)\s*\]\s*=\s*useState/g;
    let match;
    while ((match = setterRegex.exec(content)) !== null) {
      const [fullMatch, getter, setter] = match;
      // Count setter usage (excluding declaration)
      const setterCount = (content.match(new RegExp(`\\b${setter}\\b`, 'g')) || []).length;
      if (setterCount === 1) {
        // Only used in declaration, remove setter
        const replacement = `const [${getter}] = useState`;
        content = content.replace(fullMatch, replacement);
        changes.push(`Removed unused setter ${setter}`);
      }
    }
  }

  return content;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetPath = args.find(arg => !arg.startsWith('--')) || 'src';
  
  console.log('🔧 Enhanced Lint Error Fixer');
  console.log(`📁 Target: ${targetPath}`);
  console.log(`🔍 Mode: ${dryRun ? 'Dry Run' : 'Fix'}\n`);

  // Get files with errors from eslint
  const files = await glob(`${targetPath}/**/*.{ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });

  console.log(`Found ${files.length} files to check...\n`);

  const results = [];
  for (const file of files) {
    const result = await fixFile(file, dryRun);
    if (result.success || result.error) {
      results.push(result);
    }
  }

  const successful = results.filter(r => r.success);
  const errors = results.filter(r => r.error);

  if (successful.length > 0) {
    console.log(`✅ ${dryRun ? 'Would fix' : 'Fixed'} ${successful.length} files:\n`);
    for (const result of successful) {
      console.log(`📝 ${path.relative(process.cwd(), result.file)}`);
      result.changes.forEach(change => {
        console.log(`   - ${change}`);
      });
    }
  }

  if (errors.length > 0) {
    console.log(`\n❌ Errors in ${errors.length} files:`);
    for (const result of errors) {
      console.log(`  ⚠️  ${path.relative(process.cwd(), result.file)}: ${result.error}`);
    }
  }

  if (successful.length === 0 && errors.length === 0) {
    console.log('No additional fixes needed with enhanced patterns.');
  }
}

main().catch(console.error);