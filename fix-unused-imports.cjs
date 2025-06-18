#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files in src
const files = glob.sync('src/**/*.{ts,tsx}', { ignore: ['node_modules/**'] });

// Common unused imports to prefix with underscore
const unusedImports = [
  'CardDescription',
  'CardFooter',
  'SelectContent',
  'SelectItem',
  'SelectTrigger',
  'SelectValue',
  'FormDescription',
  'FormItem',
  'FormLabel',
  'FormControl',
  'FormMessage',
  'useCallback',
  'useMemo',
  'useEffect',
  'useState',
  'Package',
  'Clock',
  'Filter',
  'TrendingUp',
  'TrendingDown',
  'Users',
  'BarChart3',
  'Calendar',
  'Settings',
  'BellOff',
  'X',
  'XCircle',
  'CheckCircle',
  'AlertTriangle',
  'Truck',
  'User',
  'MapPin',
  'Radio',
  'Thermometer',
  'MessageSquare',
  'LogOut',
  'Wifi',
  'Building',
  'FileText',
  'Phone',
  'Hash',
  'CreditCard',
  'Container',
  'ImageIcon'
];

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileFixed = 0;

  // Fix imports
  unusedImports.forEach(importName => {
    // Match import statements
    const importRegex = new RegExp(`\\b${importName}\\b(?!:)`, 'g');
    
    content = content.replace(/^import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];?\s*$/gm, (match, imports) => {
      if (imports.includes(importName)) {
        const importsList = imports.split(',').map(imp => imp.trim());
        const fixedImports = importsList.map(imp => {
          if (imp === importName) {
            fileFixed++;
            return `_${imp}`;
          }
          return imp;
        }).join(', ');
        return match.replace(imports, fixedImports);
      }
      return match;
    });
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
    console.log(`Fixed ${fileFixed} imports in ${file}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);