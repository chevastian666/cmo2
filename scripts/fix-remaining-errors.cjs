#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing remaining lint errors...');

// Pattern-based fixes
const PATTERNS = {
  // Fix unused catch block variables
  unusedCatchVar: {
    pattern: /} catch \((_\w+)\) {/g,
    fix: (match) => '} catch {'
  },
  
  // Fix unused function parameters in specific patterns
  unusedCallback: {
    pattern: /subscribe\s*=\s*\(\s*eventType:\s*string,\s*callback:\s*\([^)]+\)\s*=>\s*void\s*\)/g,
    fix: () => 'subscribe = ()'
  },
  
  // Fix unused destructured variables by removing them
  removeUnusedFromDestructure: {
    pattern: /const\s*{\s*([^}]+)\s*}\s*=\s*([^;]+);/g,
    fix: (match, vars, source, content) => {
      // Special handling for specific patterns
      if (match.includes('_routes') && match.includes('_center') && match.includes('_mapType')) {
        return 'const { precintos, showControls = true, height = "100%", onMarkerClick, selectedPrecinto } = props;';
      }
      return match;
    }
  },
  
  // Fix React hook dependency issues
  fixHookDependencies: {
    pattern: /\/\/ eslint-disable-next-line react-hooks\/exhaustive-deps/g,
    fix: () => ''  // Remove if already present to avoid duplicates
  },
  
  // Fix specific any types that weren't caught
  fixRemainingAny: {
    pattern: /:\s*any(\s|;|,|\)|>|\[|\])/g,
    fix: (match) => match.replace('any', 'unknown')
  },
  
  // Fix notification options type
  fixNotificationOptions: {
    pattern: /options\?:\s*any/g,
    fix: () => 'options?: NotificationOptions'
  }
};

// Specific file fixes that need custom handling
const FILE_SPECIFIC_FIXES = [
  {
    file: 'src/features/estadisticas/pages/EstadisticasPage.tsx',
    fix: (content) => {
      // Add missing useNovedadesStore import if needed
      if (!content.includes('useNovedadesStore') && content.includes('novedades')) {
        content = content.replace(
          /import { useEstadisticasStore } from/,
          'import { useEstadisticasStore, useNovedadesStore } from'
        );
      }
      return content;
    }
  },
  {
    file: 'src/hooks/useWebSocket.ts',
    fix: (content) => {
      // Fix the options parameter
      return content.replace(
        /const options = {[^}]+};/,
        ''
      );
    }
  },
  {
    file: 'src/services/shared/notification.service.ts',
    fix: (content) => {
      // Add NotificationOptions type if missing
      if (!content.includes('interface NotificationOptions')) {
        const interfaceToAdd = `
interface NotificationOptions {
  duration?: number;
  persistent?: boolean;
  actions?: Array<{ label: string; handler: () => void }>;
  icon?: string;
}

`;
        content = content.replace(
          /class NotificationService {/,
          interfaceToAdd + 'class NotificationService {'
        );
      }
      return content;
    }
  },
  {
    file: 'src/components/optimized/optimizedUtils.ts',
    fix: (content) => {
      // Add React import if missing
      if (!content.includes("import React") && content.includes("React.")) {
        content = "import React from 'react';\n" + content;
      }
      return content;
    }
  },
  {
    file: 'src/components/priority/withPriority.tsx',
    fix: (content) => {
      // Add PriorityProps interface if missing
      if (!content.includes('interface PriorityProps')) {
        content = content.replace(
          /export function withPriority/,
          `interface PriorityProps {
  priority?: number;
}

export function withPriority`
        );
      }
      return content;
    }
  }
];

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;
    
    // Apply pattern-based fixes
    Object.entries(PATTERNS).forEach(([name, { pattern, fix }]) => {
      const newContent = content.replace(pattern, (...args) => {
        const result = fix(...args, content);
        return result;
      });
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    // Apply file-specific fixes
    const relativePath = path.relative(process.cwd(), filePath);
    const specificFix = FILE_SPECIFIC_FIXES.find(f => f.file === relativePath);
    if (specificFix) {
      const newContent = specificFix.fix(content);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    }
    
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