#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Final comprehensive fix for remaining errors...');

// Specific fixes for remaining files
const specificFixes = {
  'src/store/slices/systemStatusSlice.ts': (content) => {
    return content.replace(
      /export const createSystemStatusSlice = \(set: SetState<AppStore>, get: GetState<AppStore>\)/,
      'export const createSystemStatusSlice = (set: SetState<AppStore>)'
    );
  },
  'src/test/utils/test-utils.tsx': (content) => {
    // Remove unused data variable
    content = content.replace(
      /data: unknown\[\];/,
      '// data removed - unused'
    );
    // Fix any types
    content = content.replace(
      /value: any/g,
      'value: unknown'
    );
    return content;
  },
  'src/types/notifications.ts': (content) => {
    // Replace any with unknown or proper types
    content = content.replace(/data\?: any;/g, 'data?: Record<string, unknown>;');
    content = content.replace(/metadata\?: any;/g, 'metadata?: Record<string, unknown>;');
    content = content.replace(/payload\?: any;/g, 'payload?: Record<string, unknown>;');
    return content;
  },
  'src/utils/performance.ts': (content) => {
    // Fix unused _props
    content = content.replace(
      /ProfilerComponent:\s*React\.FC<{\s*id:\s*string;\s*_props\?:\s*unknown;\s*}>/,
      'ProfilerComponent: React.FC<{ id: string; }>'
    );
    // Fix any types
    content = content.replace(
      /export function measure<T extends \(...args: any\[\]\) => any>/g,
      'export function measure<T extends (...args: unknown[]) => unknown>'
    );
    content = content.replace(
      /export function debounce<T extends \(...args: any\[\]\) => any>/g,
      'export function debounce<T extends (...args: unknown[]) => unknown>'
    );
    content = content.replace(
      /export function throttle<T extends \(...args: any\[\]\) => any>/g,
      'export function throttle<T extends (...args: unknown[]) => unknown>'
    );
    return content;
  },
  'src/services/websocket/useWebSocket.ts': (content) => {
    // Fix _data parameter
    content = content.replace(
      /wsService\.on\('onConnectionChange', \(_data\) => {/,
      'wsService.on(\'onConnectionChange\', (data) => {'
    );
    return content;
  },
  'src/hooks/useWebSocket.ts': (content) => {
    // Fix destructuring
    content = content.replace(
      /const\s*{\s*onConnect,\s*onDisconnect,\s*onReconnect,\s*autoConnect\s*=\s*true\s*}\s*=\s*options;/,
      'const { onConnect, onDisconnect, onReconnect } = options;\n  const autoConnect = options.autoConnect ?? true;'
    );
    return content;
  }
};

// Process specific files
Object.entries(specificFixes).forEach(([file, fix]) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      content = fix(content);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
    } catch (error) {
      console.error(`❌ Error fixing ${file}:`, error.message);
    }
  }
});

// Global pattern fixes
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
});

let globalFixCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;
    
    // Fix remaining any types
    const anyPattern = /:\s*any(\s|;|,|\)|>|\[|\])/g;
    if (anyPattern.test(content)) {
      content = content.replace(anyPattern, (match) => {
        hasChanges = true;
        return match.replace('any', 'unknown');
      });
    }
    
    // Fix unused destructured variables by prefixing with _
    const unusedPattern = /(\w+) is defined but never used/g;
    const matches = content.match(unusedPattern);
    if (matches) {
      matches.forEach(match => {
        const varName = match.split(' ')[0];
        // Check if it's in a destructuring pattern
        const destructurePattern = new RegExp(`{([^}]*\\b${varName}\\b[^}]*)}`, 'g');
        content = content.replace(destructurePattern, (m, vars) => {
          const varList = vars.split(',').map(v => v.trim());
          const newVarList = varList.map(v => {
            if (v === varName || v.startsWith(`${varName}:`)) {
              hasChanges = true;
              return `_${v}`;
            }
            return v;
          });
          return `{${newVarList.join(', ')}}`;
        });
      });
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      globalFixCount++;
    }
  } catch (error) {
    // Silent fail
  }
});

console.log(`\n✨ Fixed ${globalFixCount} files with global patterns`);

// Run final lint check
console.log('\n📊 Running final lint check...');
const { execSync } = require('child_process');
try {
  const result = execSync('npm run lint 2>&1 | grep "problems" | tail -1', { encoding: 'utf8' });
  console.log(`\nFinal result: ${result}`);
} catch (error) {
  const output = error.stdout || error.message;
  const match = output.match(/✖ \d+ problems/);
  if (match) {
    console.log(`\nFinal result: ${match[0]}`);
  }
}