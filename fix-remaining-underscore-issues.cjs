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

// Function to fix destructuring with underscore prefixes
function fixDestructuringIssues(content, filePath) {
  let modified = false;
  let newContent = content;

  // Pattern 1: Fix destructuring assignments like {_var} = ... to {var} = ...
  const destructuringPattern = /const\s+\{([^}]+)\}\s*=\s*[^;]+/g;
  
  newContent = newContent.replace(destructuringPattern, (match) => {
    if (match.includes('_')) {
      // Extract the destructured variables
      const varMatch = match.match(/\{([^}]+)\}/);
      if (varMatch) {
        const vars = varMatch[1];
        const fixedVars = vars.replace(/(\w+):\s*_(\w+)/g, '$1: $2') // Fix aliased destructuring
                              .replace(/\b_(\w+)/g, '$1'); // Fix simple destructuring
        
        if (vars !== fixedVars) {
          modified = true;
          return match.replace(vars, fixedVars);
        }
      }
    }
    return match;
  });

  // Pattern 2: Fix parameter destructuring in function definitions
  const functionPattern = /\(([^)]*\{[^}]+\}[^)]*)\)/g;
  
  newContent = newContent.replace(functionPattern, (match, params) => {
    if (params.includes('_')) {
      const fixedParams = params.replace(/\b_(\w+)/g, '$1');
      if (params !== fixedParams) {
        modified = true;
        return match.replace(params, fixedParams);
      }
    }
    return match;
  });

  // Pattern 3: Fix specific hook destructuring patterns
  const hookPatterns = [
    /const\s+\{([^}]*_[^}]*)\}\s*=\s*use\w+\(/g,
  ];

  hookPatterns.forEach(pattern => {
    newContent = newContent.replace(pattern, (match) => {
      const fixedMatch = match.replace(/\b_(\w+)/g, '$1');
      if (match !== fixedMatch) {
        modified = true;
      }
      return fixedMatch;
    });
  });

  if (modified) {
    console.log(`Fixed destructuring issues in: ${filePath}`);
  }

  return { content: newContent, modified };
}

// Main function
async function main() {
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**']
  });

  let totalFixed = 0;

  for (const file of files) {
    if (shouldSkip(file)) continue;

    try {
      const content = fs.readFileSync(file, 'utf8');
      const { content: fixedContent, modified } = fixDestructuringIssues(content, file);

      if (modified) {
        fs.writeFileSync(file, fixedContent, 'utf8');
        totalFixed++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log(`\nTotal files fixed: ${totalFixed}`);
}

main().catch(console.error);