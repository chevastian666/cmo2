#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing any type issues...');

// Map of files and their specific any type fixes
const anyTypeFixes = [
  {
    file: 'src/components/charts/treemap/utils/dataTransformers.ts',
    fixes: [
      {
        find: /children:\s*any\[\]/g,
        replace: 'children: DataNode[]'
      },
      {
        find: /data:\s*any,/g,
        replace: 'data: TreemapData,'
      }
    ]
  },
  {
    file: 'src/components/optimized/optimizedUtils.ts',
    fixes: [
      {
        find: /export function useOptimizedData<T>\(data: T, dependencies\?: any\[\]\): T/,
        replace: 'export function useOptimizedData<T>(data: T, dependencies?: React.DependencyList): T'
      },
      {
        find: /defaultIfError<T>\(fn: \(\) => T, defaultValue: T, errorHandler\?: \(error: any\) => void\): T/,
        replace: 'defaultIfError<T>(fn: () => T, defaultValue: T, errorHandler?: (error: unknown) => void): T'
      }
    ]
  },
  {
    file: 'src/components/priority/withPriority.tsx',
    fixes: [
      {
        find: /React\.ComponentType<P & any>/,
        replace: 'React.ComponentType<P & PriorityProps>'
      }
    ]
  },
  {
    file: 'src/features/alertas/pages/AlertasPageV2.tsx',
    fixes: [
      {
        find: /variant={severidadInfo\.color as any}/,
        replace: 'variant={severidadInfo.color as "default" | "secondary" | "destructive" | "danger" | "warning" | "success"}'
      }
    ]
  },
  {
    file: 'src/hooks/useGlobalState.ts',
    fixes: [
      {
        find: /private resolvers = new Map<string, \(state: any\) => void>\(\);/,
        replace: 'private resolvers = new Map<string, (state: unknown) => void>();'
      },
      {
        find: /const timeout = setTimeout\(\(\) => resolve\(undefined as any\), timeoutMs\);/,
        replace: 'const timeout = setTimeout(() => resolve(undefined as T), timeoutMs);'
      }
    ]
  },
  {
    file: 'src/services/shared/notification.service.ts',
    fixes: [
      {
        find: /options\?: any/g,
        replace: 'options?: NotificationOptions'
      }
    ]
  },
  {
    file: 'src/store/slices/alertasSlice.ts',
    fixes: [
      {
        find: /verificadoPor: any;/,
        replace: 'verificadoPor?: { id: string; nombre: string; };'
      }
    ]
  },
  {
    file: 'src/test/utils/test-utils.tsx',
    fixes: [
      {
        find: /value: any/,
        replace: 'value: unknown'
      }
    ]
  },
  {
    file: 'src/types/notifications.ts',
    fixes: [
      {
        find: /data\?: any;/g,
        replace: 'data?: Record<string, unknown>;'
      },
      {
        find: /metadata\?: any;/g,
        replace: 'metadata?: Record<string, unknown>;'
      }
    ]
  },
  {
    file: 'src/utils/performance.ts',
    fixes: [
      {
        find: /export function measure<T extends \(...args: any\[\]\) => any>/,
        replace: 'export function measure<T extends (...args: unknown[]) => unknown>'
      },
      {
        find: /export function debounce<T extends \(...args: any\[\]\) => any>/,
        replace: 'export function debounce<T extends (...args: unknown[]) => unknown>'
      },
      {
        find: /export function throttle<T extends \(...args: any\[\]\) => any>/,
        replace: 'export function throttle<T extends (...args: unknown[]) => unknown>'
      }
    ]
  },
  {
    file: 'src/workers/dataProcessor.worker.ts',
    fixes: [
      {
        find: /data: any\[\]/,
        replace: 'data: unknown[]'
      }
    ]
  }
];

// Process files
let fixedCount = 0;
anyTypeFixes.forEach(({ file, fixes }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    fixes.forEach(fix => {
      const newContent = content.replace(fix.find, fix.replace);
      if (newContent !== content) {
        content = newContent;
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

console.log(`\n✨ Fixed ${fixedCount} files`);