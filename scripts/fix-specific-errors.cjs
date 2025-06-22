#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing specific remaining errors...');

// Map of specific files and their fixes
const fileFixes = [
  // Fix MapRenderer.tsx - remove unused _center
  {
    file: 'src/components/map/MapRenderer.tsx',
    fixes: [
      {
        find: /const\s*{\s*precintos,\s*_center,\s*onPrecintoClick\s*}\s*=/,
        replace: 'const { precintos, onPrecintoClick } ='
      }
    ]
  },
  
  // Fix MapView.tsx - remove unused memo import
  {
    file: 'src/components/map/MapView.tsx',
    fixes: [
      {
        find: /import React, { memo } from 'react';/,
        replace: 'import React from \'react\';'
      }
    ]
  },
  
  // Fix NotificationCenter.tsx - remove unused onToggle
  {
    file: 'src/components/notifications/NotificationCenter.tsx',
    fixes: [
      {
        find: /interface NotificationCenterProps {\s*onToggle\?:\s*\(\)\s*=>\s*void;\s*}/,
        replace: 'interface NotificationCenterProps {}'
      },
      {
        find: /const NotificationCenter:\s*React\.FC<NotificationCenterProps>\s*=\s*\(\s*{\s*onToggle\s*}\s*\)/,
        replace: 'const NotificationCenter: React.FC<NotificationCenterProps> = ()'
      }
    ]
  },
  
  // Fix VirtualizedList.tsx parsing error
  {
    file: 'src/components/optimized/VirtualizedList.tsx',
    fixes: [
      {
        find: /<<T,>>/g,
        replace: '<T>'
      }
    ]
  },
  
  // Fix PriorityProvider.tsx - remove unused _config
  {
    file: 'src/components/priority/PriorityProvider.tsx',
    fixes: [
      {
        find: /const\s+updatePriority\s*=\s*\(\s*id:\s*string,\s*priority:\s*number,\s*_config\?:\s*PriorityConfig\s*\)/,
        replace: 'const updatePriority = (id: string, priority: number)'
      }
    ]
  },
  
  // Fix withPriority.tsx - remove unused usePriorityScheduler
  {
    file: 'src/components/priority/withPriority.tsx',
    fixes: [
      {
        find: /import\s*{\s*PriorityProvider,\s*usePriority,\s*usePriorityScheduler\s*}\s*from/,
        replace: 'import { PriorityProvider, usePriority } from'
      }
    ]
  },
  
  // Fix DataTableV2.tsx - remove unused useMemo
  {
    file: 'src/components/ui/data-table/DataTableV2.tsx',
    fixes: [
      {
        find: /import\s*{\s*useState,\s*useMemo\s*}\s*from\s*'react';/,
        replace: 'import { useState } from \'react\';'
      }
    ]
  },
  
  // Fix date-picker-range.tsx - remove unused onChange
  {
    file: 'src/components/ui/date-picker-range.tsx',
    fixes: [
      {
        find: /const\s*{\s*className,\s*value,\s*onChange,\s*placeholder\s*}\s*=/,
        replace: 'const { className, value, placeholder } ='
      }
    ]
  },
  
  // Fix CompositionExample.tsx - remove unused isLoading
  {
    file: 'src/components/ui/examples/CompositionExample.tsx',
    fixes: [
      {
        find: /const\s*{\s*data,\s*isLoading,\s*error\s*}\s*=/,
        replace: 'const { data, error } ='
      }
    ]
  },
  
  // Fix form.tsx - remove unused _id
  {
    file: 'src/components/ui/form.tsx',
    fixes: [
      {
        find: /const\s+\[\s*_id,\s*name\s*\]\s*=/,
        replace: 'const [, name] ='
      }
    ]
  },
  
  // Fix MapHeader.tsx - remove activeLayers
  {
    file: 'src/components/ui/map/MapHeader.tsx',
    fixes: [
      {
        find: /const\s+activeLayers\s*=[^;]+;/,
        replace: '// const activeLayers removed - unused'
      }
    ]
  },
  
  // Fix memoryManager.ts - fix subscribe signature
  {
    file: 'src/components/virtualized-list/utils/memoryManager.ts',
    fixes: [
      {
        find: /subscribe\(\s*type:\s*string,\s*callback:[^)]+\)/,
        replace: 'subscribe(callback: () => void)'
      }
    ]
  },
  
  // Fix ArmFormCompact.tsx - replace any with FormData
  {
    file: 'src/features/armado/components/ArmFormCompact.tsx',
    fixes: [
      {
        find: /data:\s*any/g,
        replace: 'data: unknown'
      }
    ]
  },
  
  // Fix AlertasTreemap.tsx - replace any[] with proper type
  {
    file: 'src/features/analytics/components/treemap/AlertasTreemap.tsx',
    fixes: [
      {
        find: /data:\s*any\[\]/g,
        replace: 'data: unknown[]'
      }
    ]
  },
  
  // Fix TorreControlV2.tsx - remove originalActions
  {
    file: 'src/features/torre-control/components/TorreControlV2.tsx',
    fixes: [
      {
        find: /const\s+originalActions\s*=[^;]+;/,
        replace: '// const originalActions removed - unused'
      }
    ]
  },
  
  // Fix PerformanceDemo.tsx - remove toastId
  {
    file: 'src/features/performance/pages/PerformanceDemo.tsx',
    fixes: [
      {
        find: /const\s+toastId\s*=[^;]+;/,
        replace: '// const toastId removed - unused'
      }
    ]
  },
  
  // Fix PrecintoSearchCompact.tsx - fix type definition
  {
    file: 'src/features/armado/components/PrecintoSearchCompact.tsx',
    fixes: [
      {
        find: /\s+\|\s+undefined/g,
        replace: ''
      }
    ]
  },
  
  // Fix useWebSocket.ts case declarations
  {
    file: 'src/services/websocket/useWebSocket.ts',
    fixes: [
      {
        find: /case 'update':\s*store\.updatePrecinto/,
        replace: 'case \'update\': {\n          store.updatePrecinto'
      },
      {
        find: /break;\s*case 'create':/,
        replace: 'break;\n        }\n        case \'create\': {'
      },
      {
        find: /break;\s*case 'delete':/,
        replace: 'break;\n        }\n        case \'delete\': {'
      },
      {
        find: /break;\s*case 'precintado':/,
        replace: 'break;\n        }\n        case \'precintado\': {'
      },
      {
        find: /const newPrecinto = data\.precinto as unknown;/,
        replace: 'const newPrecinto = data.precinto as any;'
      },
      {
        find: /wsService\.on\('onPrecintoUpdate', \(_data\) => {/,
        replace: 'wsService.on(\'onPrecintoUpdate\', (data) => {'
      },
      {
        find: /wsService\.on\('onTransitoUpdate', \(_data\) => {/,
        replace: 'wsService.on(\'onTransitoUpdate\', (data) => {'
      },
      {
        find: /wsService\.on\('onAlertaNueva', \(_data\) => {/,
        replace: 'wsService.on(\'onAlertaNueva\', (data) => {'
      },
      {
        find: /wsService\.on\('onAlertaUpdate', \(_data\) => {/,
        replace: 'wsService.on(\'onAlertaUpdate\', (data) => {'
      },
      {
        find: /wsService\.on\('onSistemaUpdate', \(_data\) => {/,
        replace: 'wsService.on(\'onSistemaUpdate\', (data) => {'
      },
      {
        find: /case 'create': {\s*const newTransito/,
        replace: 'case \'create\': {\n          const newTransito'
      }
    ]
  },
  
  // Fix errorHandling.ts - remove unused options
  {
    file: 'src/store/middleware/errorHandling.ts',
    fixes: [
      {
        find: /const\s+{\s*errorMessage\s*=\s*'[^']+',\s*successMessage,\s*showNotification\s*=\s*true\s*}\s*=\s*options\s*=\s*{};/,
        replace: '// Options parameter removed - unused'
      }
    ]
  },
  
  // Fix logger.ts - remove unused options
  {
    file: 'src/store/middleware/logger.ts',
    fixes: [
      {
        find: /const\s+mergedOptions\s*=\s*{\s*\.\.\.defaultOptions,\s*\.\.\.options\s*};/,
        replace: 'const mergedOptions = { ...defaultOptions };'
      }
    ]
  },
  
  // Fix persistHelpers.ts - remove unused options parameter
  {
    file: 'src/store/middleware/persistHelpers.ts',
    fixes: [
      {
        find: /export const createPersistConfig = <T,>\(\s*name:\s*string,\s*options\?:\s*Partial<PersistOptions<T>>\s*\)/,
        replace: 'export const createPersistConfig = <T,>(name: string)'
      }
    ]
  },
  
  // Fix alertasSlice.ts - replace any
  {
    file: 'src/store/slices/alertasSlice.ts',
    fixes: [
      {
        find: /\(error:\s*any\)/g,
        replace: '(error: unknown)'
      }
    ]
  },
  
  // Fix precintosSlice.ts - remove unused get
  {
    file: 'src/store/slices/precintosSlice.ts',
    fixes: [
      {
        find: /export const createPrecintosSlice: StateCreator<PrecintosState> = \(set, get\) => \(/,
        replace: 'export const createPrecintosSlice: StateCreator<PrecintosState> = (set) => ('
      }
    ]
  },
  
  // Fix systemStatusSlice.ts - remove unused get
  {
    file: 'src/store/slices/systemStatusSlice.ts',
    fixes: [
      {
        find: /export const createSystemStatusSlice: StateCreator<SystemStatusState> = \(set, get\) => \(/,
        replace: 'export const createSystemStatusSlice: StateCreator<SystemStatusState> = (set) => ('
      }
    ]
  },
  
  // Fix test-utils.tsx
  {
    file: 'src/test/utils/test-utils.tsx',
    fixes: [
      {
        find: /const\s+{\s*id,\s*data\s*}\s*=\s*params;/,
        replace: 'const { id } = params;'
      },
      {
        find: /\(acc:\s*Record<string,\s*any>,\s*key:\s*string\)/g,
        replace: '(acc: Record<string, unknown>, key: string)'
      }
    ]
  },
  
  // Fix notifications.ts - replace any
  {
    file: 'src/types/notifications.ts',
    fixes: [
      {
        find: /customSettings\?:\s*Record<string,\s*any>;/g,
        replace: 'customSettings?: Record<string, unknown>;'
      },
      {
        find: /customFields\?:\s*Record<string,\s*any>;/g,
        replace: 'customFields?: Record<string, unknown>;'
      },
      {
        find: /metadata\?:\s*Record<string,\s*any>;/g,
        replace: 'metadata?: Record<string, unknown>;'
      }
    ]
  },
  
  // Fix performance.ts
  {
    file: 'src/utils/performance.ts',
    fixes: [
      {
        find: /const MeasuredComponent = \(_props: unknown\) => {/,
        replace: 'const MeasuredComponent = (props: any) => {'
      },
      {
        find: /<T extends \(\.\.\._args: unknown\[\]\) => any>/g,
        replace: '<T extends (...args: any[]) => any>'
      },
      {
        find: /getKey\?: \(\.\.\._args: Parameters<T>\) => string/g,
        replace: 'getKey?: (...args: Parameters<T>) => string'
      }
    ]
  }
];

// Process each file
let fixedCount = 0;
fileFixes.forEach(({ file, fixes }) => {
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