#!/usr/bin/env node
/**
 * Script to fix any types with proper TypeScript types
 * By Cheva
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Type mappings for common patterns
const typeReplacements = {
  // Function parameters and returns
  'any\\[\\]': 'unknown[]',
  ': any\\)': ': unknown)',
  '<any>': '<unknown>',
  'as any': 'as unknown',
  ': any;': ': unknown;',
  ': any,': ': unknown,',
  ': any =': ': unknown =',
  
  // Specific patterns
  'Record<string, any>': 'Record<string, unknown>',
  'React.FC<any>': 'React.FC<Record<string, unknown>>',
  'Promise<any>': 'Promise<unknown>',
  
  // Event handlers
  'e: any\\)': 'e: React.MouseEvent | React.ChangeEvent | React.FormEvent)',
  'event: any\\)': 'event: Event)',
  'error: any\\)': 'error: Error | unknown)',
  'data: any\\)': 'data: unknown)',
  'response: any\\)': 'response: Response | unknown)',
  'result: any\\)': 'result: unknown)',
  'value: any\\)': 'value: unknown)',
  'item: any\\)': 'item: unknown)',
  'params: any\\)': 'params: Record<string, unknown>)',
  'config: any\\)': 'config: Record<string, unknown>)',
  'options: any\\)': 'options: Record<string, unknown>)',
  
  // Catch blocks  
  'catch \\(error: any\\)': 'catch (error)',
  'catch \\(e: any\\)': 'catch (e)',
  
  // Arrays and objects
  'any\\[\\]\\[\\]': 'unknown[][]',
  '\\(any\\)': '(unknown)',
  
  // Store types
  'state: any': 'state: unknown',
  'action: any': 'action: { type: string; payload?: unknown }',
  'payload: any': 'payload: unknown',
};

// Get all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', { 
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
});

const apiFiles = glob.sync('api/src/**/*.{ts,tsx}', { 
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
});

const e2eFiles = glob.sync('e2e/**/*.{ts,tsx}', { 
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
});

const allFiles = [...files, ...apiFiles, ...e2eFiles];

let totalFixes = 0;
const fixedFiles = [];

allFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let fileFixed = false;
    
    // Apply type replacements
    Object.entries(typeReplacements).forEach(([pattern, replacement]) => {
      const regex = new RegExp(pattern, 'g');
      const newContent = content.replace(regex, replacement);
      if (newContent !== content) {
        content = newContent;
        fileFixed = true;
      }
    });
    
    // Fix specific patterns in specific file types
    if (file.includes('.test.') || file.includes('.spec.')) {
      // In test files, use more specific types
      content = content.replace(/expect\(([^)]+)\)\.toHaveBeenCalledWith\(([^)]+): any\)/g, 
        'expect($1).toHaveBeenCalledWith($2)');
    }
    
    // Fix hooks files
    if (file.includes('use') && file.endsWith('.ts')) {
      content = content.replace(/return (.+): any;/g, 'return $1;');
    }
    
    // Fix React component props
    if (file.endsWith('.tsx')) {
      content = content.replace(/interface (\w+)Props \{([^}]+)\}/g, (match, name, props) => {
        const fixedProps = props.replace(/: any([;,])/g, ': unknown$1');
        return `interface ${name}Props {${fixedProps}}`;
      });
    }
    
    if (fileFixed && content !== originalContent) {
      fs.writeFileSync(file, content);
      totalFixes++;
      fixedFiles.push(file);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nTotal files fixed: ${totalFixes}`);
if (fixedFiles.length > 0) {
  console.log('\nFixed files:');
  fixedFiles.forEach(file => console.log(`  - ${file}`));
}

// Now fix specific known issues
const specificFixes = [
  {
    file: 'src/utils/export.ts',
    replacements: [
      { from: 'data: any[]', to: 'data: Record<string, unknown>[]' },
      { from: 'row: any', to: 'row: Record<string, unknown>' },
      { from: 'value: any', to: 'value: unknown' }
    ]
  },
  {
    file: 'src/utils/performance.ts',
    replacements: [
      { from: 'fn: any', to: 'fn: (...args: unknown[]) => unknown' },
      { from: 'args: any[]', to: 'args: unknown[]' },
      { from: 'result: any', to: 'result: unknown' }
    ]
  },
  {
    file: 'src/test/setup.ts',
    replacements: [
      { from: 'as any', to: 'as unknown' },
      { from: 'global.google = {', to: '(global as any).google = {' }
    ]
  },
  {
    file: 'src/test/utils/test-utils.tsx',
    replacements: [
      { from: 'initialState: any', to: 'initialState: Record<string, unknown>' },
      { from: 'overrides: any', to: 'overrides: Partial<Record<string, unknown>>' }
    ]
  },
  {
    file: 'src/store/store.ts',
    replacements: [
      { from: ': any', to: ': unknown' }
    ]
  },
  {
    file: 'e2e/fixtures/auth.fixture.ts',
    replacements: [
      { from: 'use(', to: 'await use(' }
    ]
  }
];

specificFixes.forEach(({ file: fileName, replacements }) => {
  const filePath = path.join(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      replacements.forEach(({ from, to }) => {
        if (content.includes(from)) {
          content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`\nApplied specific fixes to: ${fileName}`);
      }
    } catch (error) {
      console.error(`Error fixing ${fileName}:`, error.message);
    }
  }
});

console.log('\nType fixes completed!');
console.log('Run "npm run lint" to see remaining issues.');