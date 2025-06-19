const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Files to skip
const filesToSkip = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  '.vite',
  'fix-'
];

// Function to check if path should be skipped
function shouldSkip(filePath) {
  return filesToSkip.some(skip => filePath.includes(skip));
}

// Function to fix common issues in TSX files
function fixTsxIssues(content, filePath) {
  let modified = false;
  let newContent = content;

  // Fix 1: Handle underscore prefix mismatches in variable references
  // Find all variable declarations and their usage
  const fixes = [];

  // Pattern to find catch blocks with _error but referencing error
  newContent = newContent.replace(/catch\s*\(\s*_error\s*\)\s*\{([^}]+)\}/g, (match, block) => {
    if (block.includes('throw error') && !block.includes('throw _error')) {
      modified = true;
      fixes.push('Fixed throw error to throw _error in catch block');
      return match.replace('throw error', 'throw _error');
    }
    return match;
  });

  // Pattern to find destructuring mismatches
  const destructuringPattern = /const\s+\{([^}]+)\}\s*=\s*([^;]+);/g;
  const destructuredVars = new Map();
  
  let match;
  while ((match = destructuringPattern.exec(content)) !== null) {
    const vars = match[1];
    // Parse destructured variables
    const varPairs = vars.split(',').map(v => v.trim());
    varPairs.forEach(pair => {
      if (pair.includes(':')) {
        const [original, alias] = pair.split(':').map(s => s.trim());
        destructuredVars.set(alias, original);
      } else {
        destructuredVars.set(pair, pair);
      }
    });
  }

  // Fix 2: Fix incorrect references to destructured variables
  destructuredVars.forEach((original, alias) => {
    if (alias.startsWith('_') && !original.startsWith('_')) {
      // Look for references to the non-underscored version
      const nonUnderscored = alias.substring(1);
      const regex = new RegExp(`\\b${nonUnderscored}\\b(?![:\\w])`, 'g');
      
      // Check if the non-underscored version is used
      if (regex.test(newContent)) {
        // Check if it's not already declared elsewhere
        const declarationRegex = new RegExp(`\\b(?:const|let|var)\\s+${nonUnderscored}\\b`);
        if (!declarationRegex.test(newContent)) {
          newContent = newContent.replace(regex, alias);
          modified = true;
          fixes.push(`Fixed reference: ${nonUnderscored} -> ${alias}`);
        }
      }
    }
  });

  // Fix 3: Fix if statements checking wrong variable names
  // Common pattern: if (_error) but error is defined
  const ifPatterns = [
    { pattern: /if\s*\(\s*_error\s*\)/g, correct: 'error', incorrect: '_error' },
    { pattern: /if\s*\(\s*_data\s*\)/g, correct: 'data', incorrect: '_data' },
    { pattern: /if\s*\(\s*_loading\s*\)/g, correct: 'loading', incorrect: '_loading' }
  ];

  ifPatterns.forEach(({ pattern, correct, incorrect }) => {
    if (pattern.test(newContent)) {
      // Check if the correct variable is defined
      const correctVarRegex = new RegExp(`\\b(?:const|let|var)\\s+.*\\b${correct}\\b`);
      const incorrectVarRegex = new RegExp(`\\b(?:const|let|var)\\s+.*\\b${incorrect}\\b`);
      
      if (correctVarRegex.test(newContent) && !incorrectVarRegex.test(newContent)) {
        newContent = newContent.replace(pattern, `if (${correct})`);
        modified = true;
        fixes.push(`Fixed if statement: ${incorrect} -> ${correct}`);
      }
    }
  });

  // Fix 4: Fix dependency arrays in hooks
  const hookDependencyPattern = /\],\s*\[([^\]]+)\]\s*\)/g;
  newContent = newContent.replace(hookDependencyPattern, (match, deps) => {
    let newDeps = deps;
    let depsModified = false;
    
    // Check each dependency
    deps.split(',').forEach(dep => {
      const trimmedDep = dep.trim();
      if (trimmedDep.startsWith('_')) {
        const nonUnderscored = trimmedDep.substring(1);
        // Check if the non-underscored version is what's actually defined
        const varRegex = new RegExp(`\\b(?:const|let|var)\\s+.*\\b${nonUnderscored}\\b`);
        if (varRegex.test(newContent) && !new RegExp(`\\b${trimmedDep}\\b`).test(newContent.split(match)[0])) {
          newDeps = newDeps.replace(trimmedDep, nonUnderscored);
          depsModified = true;
        }
      }
    });
    
    if (depsModified) {
      modified = true;
      fixes.push('Fixed hook dependency array');
    }
    
    return `], [${newDeps}])`;
  });

  // Fix 5: Fix template literal variable references
  const templateLiteralPattern = /\$\{([^}]+)\}/g;
  let templateMatch;
  const templateFixes = [];
  
  while ((templateMatch = templateLiteralPattern.exec(newContent)) !== null) {
    const varName = templateMatch[1].trim();
    if (!varName.startsWith('_') && destructuredVars.has('_' + varName)) {
      templateFixes.push({ 
        from: `\${${varName}}`, 
        to: `\${_${varName}}` 
      });
    }
  }
  
  templateFixes.forEach(fix => {
    newContent = newContent.replace(fix.from, fix.to);
    if (newContent !== content) {
      modified = true;
      fixes.push(`Fixed template literal: ${fix.from} -> ${fix.to}`);
    }
  });

  // Fix 6: Fix JSX attribute references
  destructuredVars.forEach((original, alias) => {
    if (alias.startsWith('_')) {
      const nonUnderscored = alias.substring(1);
      // Look for JSX attributes
      const jsxAttrPattern = new RegExp(`\\b${nonUnderscored}=\\{${nonUnderscored}\\}`, 'g');
      if (jsxAttrPattern.test(newContent)) {
        newContent = newContent.replace(jsxAttrPattern, `${nonUnderscored}={${alias}}`);
        modified = true;
        fixes.push(`Fixed JSX attribute: ${nonUnderscored} -> ${alias}`);
      }
    }
  });

  if (modified && fixes.length > 0) {
    console.log(`Fixed ${filePath}:`);
    fixes.forEach(fix => console.log(`  - ${fix}`));
  }

  return { content: newContent, modified };
}

// Main function
async function main() {
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**']
  });

  let totalFixed = 0;
  const errors = [];

  for (const file of files) {
    if (shouldSkip(file)) continue;

    try {
      const content = fs.readFileSync(file, 'utf8');
      const { content: fixedContent, modified } = fixTsxIssues(content, file);

      if (modified) {
        fs.writeFileSync(file, fixedContent, 'utf8');
        totalFixed++;
      }
    } catch (error) {
      errors.push({ file, error: error.message });
    }
  }

  console.log(`\nTotal files fixed: ${totalFixed}`);
  
  if (errors.length > 0) {
    console.log(`\nErrors encountered:`);
    errors.forEach(({ file, error }) => {
      console.log(`  ${file}: ${error}`);
    });
  }

  // Run specific checks for common problem files
  console.log('\nChecking specific problem patterns...');
  
  const problemPatterns = [
    { 
      pattern: /\b_error\b.*is not defined/,
      description: 'Undefined _error references'
    },
    {
      pattern: /\b_data\b.*is not defined/,
      description: 'Undefined _data references'
    },
    {
      pattern: /\bmodule.*does not provide.*export.*'_/,
      description: 'Incorrect underscore imports'
    }
  ];

  for (const file of files) {
    if (shouldSkip(file)) continue;
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      problemPatterns.forEach(({ pattern, description }) => {
        if (pattern.test(content)) {
          console.log(`  Warning in ${file}: Potential ${description}`);
        }
      });
    } catch (error) {
      // Skip errors in this check
    }
  }
}

main().catch(console.error);