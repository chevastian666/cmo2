#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining any type errors...');

const fixes = [
  // Components
  {
    file: 'src/components/optimized/optimizedUtils.ts',
    fixes: [
      {
        find: 'const aVal = (a as any)[options.sortBy!];',
        replace: 'const aVal = (a as Record<string, unknown>)[options.sortBy!];'
      },
      {
        find: 'const bVal = (b as any)[options.sortBy!];',
        replace: 'const bVal = (b as Record<string, unknown>)[options.sortBy!];'
      },
      {
        find: 'result.filter(item => (item as any)[options.filterBy!.key] === options.filterBy!.value);',
        replace: 'result.filter(item => (item as Record<string, unknown>)[options.filterBy!.key] === options.filterBy!.value);'
      }
    ]
  },
  {
    file: 'src/components/priority/withPriority.tsx',
    fixes: [
      {
        find: '(props: any)',
        replace: '(props: P)'
      }
    ]
  },
  
  // Features
  {
    file: 'src/features/alertas/pages/AlertasPageV2.tsx',
    fixes: [
      {
        find: 'variant: (alert.severidad as any)',
        replace: 'variant: (alert.severidad as "critica" | "alta" | "media" | "baja")'
      }
    ]
  },
  {
    file: 'src/features/dashboard/components/Dashboard.tsx',
    fixes: [
      {
        find: '(precinto.estado as any)',
        replace: '(precinto.estado as "activo" | "inactivo" | "alarma")'
      }
    ]
  },
  {
    file: 'src/features/dashboard/components/DashboardRefactored.tsx',
    fixes: [
      {
        find: '(a as any)[sortConfig.key]',
        replace: '(a as Record<string, unknown>)[sortConfig.key]'
      },
      {
        find: '(b as any)[sortConfig.key]',
        replace: '(b as Record<string, unknown>)[sortConfig.key]'
      }
    ]
  },
  
  // Services
  {
    file: 'src/services/api/trokor.service.ts',
    fixes: [
      {
        find: 'data: any',
        replace: 'data: unknown'
      },
      {
        find: 'any[]',
        replace: 'unknown[]'
      }
    ]
  },
  {
    file: 'src/services/notifications/soundService.ts',
    fixes: [
      {
        find: 'error: any',
        replace: 'error: unknown'
      },
      {
        find: 'customSettings?: any',
        replace: 'customSettings?: unknown'
      }
    ]
  },
  {
    file: 'src/services/shared/sharedApi.service.ts',
    fixes: [
      {
        find: '(error as any).code',
        replace: '(error as Error & { code?: string }).code'
      }
    ]
  },
  
  // Store
  {
    file: 'src/store/slices/alertasSlice.ts',
    fixes: [
      {
        find: '(error: any)',
        replace: '(error: unknown)'
      },
      {
        find: 'error.message',
        replace: '(error as Error).message'
      }
    ]
  },
  
  // Test utilities
  {
    file: 'src/test/utils/test-utils.tsx',
    fixes: [
      {
        find: 'acc: Record<string, any>',
        replace: 'acc: Record<string, unknown>'
      }
    ]
  },
  
  // Types
  {
    file: 'src/types/notifications.ts',
    fixes: [
      {
        find: 'customSettings?: Record<string, any>;',
        replace: 'customSettings?: Record<string, unknown>;'
      },
      {
        find: 'customFields?: Record<string, any>',
        replace: 'customFields?: Record<string, unknown>'
      },
      {
        find: 'metadata?: Record<string, any>',
        replace: 'metadata?: Record<string, unknown>'
      }
    ]
  },
  
  // Utils
  {
    file: 'src/utils/performance.ts',
    fixes: [
      {
        find: '(props: any)',
        replace: '(props: unknown)'
      },
      {
        find: '<T extends (...args: any[]) => any>',
        replace: '<T extends (...args: unknown[]) => unknown>'
      },
      {
        find: 'func: T',
        replace: 'func: T'
      }
    ]
  }
];

// Generic any replacements
const genericReplacements = [
  { find: /:\s*any\[\]/g, replace: ': unknown[]' },
  { find: /:\s*any;/g, replace: ': unknown;' },
  { find: /:\s*any\)/g, replace: ': unknown)' },
  { find: /:\s*any,/g, replace: ': unknown,' },
  { find: /\s+as\s+any\)/g, replace: ' as unknown)' },
  { find: /\s+as\s+any;/g, replace: ' as unknown;' },
  { find: /Record<string,\s*any>/g, replace: 'Record<string, unknown>' },
  { find: /\(error:\s*any\)/g, replace: '(error: unknown)' },
  { find: /\(\.\.\._?args:\s*any\[\]\)/g, replace: '(...args: unknown[])' }
];

// Process specific fixes
let fixedCount = 0;

fixes.forEach(({ file, fixes }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    fixes.forEach(({ find, replace }) => {
      if (content.includes(find)) {
        content = content.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

// Apply generic replacements to all TypeScript files
const glob = require('glob');
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
});

let genericFixCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    genericReplacements.forEach(({ find, replace }) => {
      content = content.replace(find, replace);
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      genericFixCount++;
    }
  } catch (error) {
    // Silent fail
  }
});

console.log(`\n✨ Fixed ${fixedCount} files with specific any type replacements`);
console.log(`✨ Fixed ${genericFixCount} files with generic any type replacements`);