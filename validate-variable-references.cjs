const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Function to extract all variable declarations from a file
function extractVariableDeclarations(content) {
  const variables = new Set();
  
  // Pattern 1: const/let/var declarations
  const declarationPattern = /\b(?:const|let|var)\s+(\w+)\s*[=;]/g;
  let match;
  while ((match = declarationPattern.exec(content)) !== null) {
    variables.add(match[1]);
  }
  
  // Pattern 2: Destructured variables
  const destructurePattern = /\b(?:const|let|var)\s+\{([^}]+)\}/g;
  while ((match = destructurePattern.exec(content)) !== null) {
    const vars = match[1].split(',').map(v => {
      const trimmed = v.trim();
      // Handle aliased destructuring
      if (trimmed.includes(':')) {
        return trimmed.split(':')[1].trim();
      }
      return trimmed;
    });
    vars.forEach(v => variables.add(v));
  }
  
  // Pattern 3: Function parameters
  const functionPattern = /function\s*\w*\s*\(([^)]*)\)|=>\s*\(([^)]*)\)|^\s*\(([^)]*)\)\s*=>/gm;
  while ((match = functionPattern.exec(content)) !== null) {
    const params = (match[1] || match[2] || match[3] || '').split(',').map(p => {
      const trimmed = p.trim();
      // Extract parameter name (handle destructuring, default values, etc.)
      const paramMatch = trimmed.match(/^(\w+)/);
      if (paramMatch) {
        variables.add(paramMatch[1]);
      }
      return trimmed;
    });
  }
  
  // Pattern 4: Catch block variables
  const catchPattern = /catch\s*\(\s*(\w+)\s*\)/g;
  while ((match = catchPattern.exec(content)) !== null) {
    variables.add(match[1]);
  }
  
  return variables;
}

// Function to find undefined variable references
function findUndefinedReferences(content, filePath) {
  const declaredVars = extractVariableDeclarations(content);
  const issues = [];
  
  // Common patterns where variables are referenced
  const referencePatterns = [
    { 
      pattern: /if\s*\(\s*(\w+)\s*[)&|]/g, 
      context: 'if statement' 
    },
    { 
      pattern: /\$\{(\w+)\}/g, 
      context: 'template literal' 
    },
    { 
      pattern: /return\s+(\w+)\s*[;,\s]/g, 
      context: 'return statement' 
    },
    { 
      pattern: /throw\s+(\w+)\s*[;,\s]/g, 
      context: 'throw statement' 
    },
    { 
      pattern: /\[([^\]]+)\]\s*\)/g, 
      context: 'dependency array',
      multiVar: true 
    },
    {
      pattern: /(\w+)\s*\?\s*\w+\s*:/g,
      context: 'ternary operator'
    },
    {
      pattern: /(\w+)\s*&&/g,
      context: 'logical AND'
    },
    {
      pattern: /(\w+)\s*\|\|/g,
      context: 'logical OR'
    }
  ];
  
  // Built-in globals and React/TypeScript keywords to ignore
  const ignoredIdentifiers = new Set([
    'console', 'window', 'document', 'process', 'require', 'module', 'exports',
    'undefined', 'null', 'true', 'false', 'this', 'super',
    'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON',
    'Promise', 'Error', 'Set', 'Map', 'WeakMap', 'WeakSet',
    'React', 'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef',
    'import', 'export', 'default', 'if', 'else', 'return', 'throw',
    'try', 'catch', 'finally', 'async', 'await', 'new', 'typeof', 'instanceof',
    'navigator', 'location', 'history', 'fetch', 'localStorage', 'sessionStorage'
  ]);
  
  referencePatterns.forEach(({ pattern, context, multiVar }) => {
    let match;
    const regex = new RegExp(pattern);
    while ((match = regex.exec(content)) !== null) {
      if (multiVar) {
        // Handle comma-separated variables
        const vars = match[1].split(',').map(v => v.trim());
        vars.forEach(varName => {
          if (varName && !declaredVars.has(varName) && !ignoredIdentifiers.has(varName)) {
            // Check if it's a property access
            if (!varName.includes('.') && !varName.includes('[')) {
              issues.push({
                variable: varName,
                context,
                line: content.substring(0, match.index).split('\n').length
              });
            }
          }
        });
      } else {
        const varName = match[1];
        if (varName && !declaredVars.has(varName) && !ignoredIdentifiers.has(varName)) {
          // Check if it's a property access
          if (!varName.includes('.') && !varName.includes('[')) {
            issues.push({
              variable: varName,
              context,
              line: content.substring(0, match.index).split('\n').length
            });
          }
        }
      }
    }
  });
  
  return issues;
}

// Function to suggest fixes
function suggestFixes(content, issues) {
  const suggestions = [];
  
  issues.forEach(issue => {
    // Check if an underscored version exists
    const underscoredVar = '_' + issue.variable;
    const nonUnderscoredVar = issue.variable.startsWith('_') ? issue.variable.substring(1) : null;
    
    if (content.includes(underscoredVar)) {
      suggestions.push({
        issue,
        fix: `Change ${issue.variable} to ${underscoredVar}`,
        from: issue.variable,
        to: underscoredVar
      });
    } else if (nonUnderscoredVar && content.includes(nonUnderscoredVar)) {
      suggestions.push({
        issue,
        fix: `Change ${issue.variable} to ${nonUnderscoredVar}`,
        from: issue.variable,
        to: nonUnderscoredVar
      });
    }
  });
  
  return suggestions;
}

// Main function
async function main() {
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}']
  });

  let totalIssues = 0;
  const fileIssues = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const issues = findUndefinedReferences(content, file);
      
      if (issues.length > 0) {
        const suggestions = suggestFixes(content, issues);
        fileIssues.push({ file, issues, suggestions });
        totalIssues += issues.length;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log(`\nFound ${totalIssues} potential undefined reference issues in ${fileIssues.length} files\n`);
  
  // Show detailed report
  fileIssues.forEach(({ file, issues, suggestions }) => {
    console.log(`${file}:`);
    issues.forEach((issue, index) => {
      console.log(`  Line ${issue.line}: ${issue.variable} used in ${issue.context}`);
      const suggestion = suggestions.find(s => s.issue === issue);
      if (suggestion) {
        console.log(`    → Suggested fix: ${suggestion.fix}`);
      }
    });
    console.log('');
  });

  // Ask if user wants to apply suggested fixes
  if (fileIssues.length > 0) {
    console.log('\nApplying automatic fixes where possible...\n');
    
    let fixedCount = 0;
    fileIssues.forEach(({ file, suggestions }) => {
      if (suggestions.length > 0) {
        try {
          let content = fs.readFileSync(file, 'utf8');
          let modified = false;
          
          suggestions.forEach(({ from, to }) => {
            // Create regex to match whole word only
            const regex = new RegExp(`\\b${from}\\b`, 'g');
            const newContent = content.replace(regex, to);
            if (newContent !== content) {
              content = newContent;
              modified = true;
            }
          });
          
          if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Fixed ${file}`);
            fixedCount++;
          }
        } catch (error) {
          console.error(`Error fixing ${file}:`, error.message);
        }
      }
    });
    
    console.log(`\nAutomatically fixed ${fixedCount} files`);
  }
}

main().catch(console.error);