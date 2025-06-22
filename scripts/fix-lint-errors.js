#!/usr/bin/env node

/**
 * Automated lint error fixer for common patterns
 * By Cheva
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Pattern definitions for automatic fixes
const FIX_PATTERNS = {
  // Remove unused variables that start with underscore
  unusedUnderscore: {
    pattern: /^\s*(?:const|let|var)\s+\[?_\w+\]?\s*(?:,\s*\w+)*\s*=\s*[^;]+;?\s*$/gm,
    fix: (match, file) => {
      // Check if it's a destructuring pattern where we need the second variable
      if (match.includes('[') && match.includes(',')) {
        // Keep the destructuring but remove the unused first variable
        return match.replace(/\[_\w+,/, '[,');
      }
      // Otherwise remove the entire line
      return '';
    },
    description: 'Remove unused variables prefixed with underscore'
  },

  // Fix case declarations without block scope
  caseDeclarations: {
    pattern: /case\s+['"`]?\w+['"`]?\s*:\s*\n\s*(const|let|var)\s+/g,
    fix: (match) => {
      const caseMatch = match.match(/(case\s+['"`]?\w+['"`]?\s*:)/);
      if (caseMatch) {
        return caseMatch[1] + ' {\n        ' + match.substring(caseMatch[1].length);
      }
      return match;
    },
    description: 'Add block scope to case statements with declarations',
    postProcess: (content) => {
      // Add closing braces before break statements
      return content.replace(/(\n\s*break;)(?!\s*})/g, '\n      }$1');
    }
  },

  // Replace any types with unknown
  anyToUnknown: {
    pattern: /:\s*any(\s|;|,|\)|>)/g,
    fix: (match) => match.replace('any', 'unknown'),
    description: 'Replace any types with unknown'
  },

  // Fix unexpected multiline between function and parenthesis
  unexpectedMultiline: {
    pattern: /\)\s*\n\s*\(/g,
    fix: () => ')(',
    description: 'Fix unexpected newline between function and ('
  },

  // Remove unused imports
  unusedImports: {
    pattern: /^import\s+(?:type\s+)?{\s*([^}]+)\s*}\s+from\s+['"][^'"]+['"];?\s*$/gm,
    fix: (match, file, content) => {
      const imports = match.match(/{\s*([^}]+)\s*}/)[1];
      const importList = imports.split(',').map(i => i.trim());
      const usedImports = [];
      
      for (const imp of importList) {
        const importName = imp.split(' as ')[0].trim();
        // Check if the import is used in the file (not in the import statement itself)
        const regex = new RegExp(`\\b${importName}\\b`, 'g');
        const matches = content.match(regex);
        if (matches && matches.length > 1) { // > 1 because it appears in the import
          usedImports.push(imp);
        }
      }
      
      if (usedImports.length === 0) {
        return ''; // Remove entire import
      } else if (usedImports.length < importList.length) {
        return match.replace(/{\s*[^}]+\s*}/, `{ ${usedImports.join(', ')} }`);
      }
      return match;
    },
    description: 'Remove unused imports'
  }
};

// ESLint disable patterns for complex cases
const ESLINT_DISABLE_PATTERNS = {
  // For legitimate unused variables in function signatures
  unusedFunctionParams: {
    pattern: /function\s+\w+\s*\([^)]*\b_\w+\b[^)]*\)/g,
    fix: (match) => `// eslint-disable-next-line @typescript-eslint/no-unused-vars\n${match}`,
    description: 'Add ESLint disable for unused function parameters'
  }
};

async function fixFile(filePath, patterns, dryRun = false) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const originalContent = content;
    let changesMade = [];

    for (const [name, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        let newContent = content;
        
        if (pattern.fix.length === 3) {
          // Fix function expects (match, file, content)
          newContent = content.replace(pattern.pattern, (match) => 
            pattern.fix(match, filePath, content)
          );
        } else {
          newContent = content.replace(pattern.pattern, pattern.fix);
        }
        
        if (pattern.postProcess) {
          newContent = pattern.postProcess(newContent);
        }
        
        if (newContent !== content) {
          changesMade.push(`${pattern.description} (${matches.length} occurrences)`);
          content = newContent;
        }
      }
    }

    if (changesMade.length > 0) {
      if (!dryRun) {
        await fs.writeFile(filePath, content);
      }
      return {
        file: filePath,
        changes: changesMade,
        modified: true
      };
    }

    return { file: filePath, modified: false };
  } catch (error) {
    return { file: filePath, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetPath = args.find(arg => !arg.startsWith('--')) || 'src';
  
  console.log(`🔧 CMO Lint Error Auto-Fixer`);
  console.log(`📁 Target: ${targetPath}`);
  console.log(`🔍 Mode: ${dryRun ? 'Dry Run' : 'Fix'}\n`);

  // Find all TypeScript files
  const files = await glob(`${targetPath}/**/*.{ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });

  console.log(`Found ${files.length} files to process...\n`);

  const results = await Promise.all(
    files.map(file => fixFile(file, FIX_PATTERNS, dryRun))
  );

  const modifiedFiles = results.filter(r => r.modified);
  const errorFiles = results.filter(r => r.error);

  if (modifiedFiles.length > 0) {
    console.log(`✅ ${dryRun ? 'Would modify' : 'Modified'} ${modifiedFiles.length} files:\n`);
    for (const result of modifiedFiles) {
      console.log(`  📝 ${path.relative(process.cwd(), result.file)}`);
      for (const change of result.changes) {
        console.log(`     - ${change}`);
      }
    }
  }

  if (errorFiles.length > 0) {
    console.log(`\n❌ Errors in ${errorFiles.length} files:`);
    for (const result of errorFiles) {
      console.log(`  ⚠️  ${path.relative(process.cwd(), result.file)}: ${result.error}`);
    }
  }

  if (modifiedFiles.length === 0 && errorFiles.length === 0) {
    console.log('✨ No fixes needed!');
  }

  // Run ESLint to show remaining errors
  if (!dryRun && modifiedFiles.length > 0) {
    console.log('\n🔍 Running ESLint to check remaining errors...\n');
    try {
      const { stdout, stderr } = await execAsync('npm run lint');
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      // ESLint exits with error code when there are lint errors
      // We still want to show the output
      if (error.stdout) console.log(error.stdout);
      if (error.stderr) console.error(error.stderr);
    }
  }
}

// Run the script
main().catch(console.error);