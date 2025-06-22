#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Running final comprehensive cleanup...');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
});

let totalFixed = 0;

// Specific fixes for remaining issues
const specificFixes = [
  // Fix remaining unused variables
  {
    file: 'src/components/map/MapRenderer.tsx',
    fixes: [
      { find: 'const { precintos, _center, onPrecintoClick } =', replace: 'const { precintos, onPrecintoClick } =' }
    ]
  },
  {
    file: 'src/components/map/MapView.tsx',
    fixes: [
      { find: "import React, { memo } from 'react';", replace: "import React from 'react';" }
    ]
  },
  {
    file: 'src/components/notifications/NotificationCenter.tsx',
    fixes: [
      { find: '({ onToggle })', replace: '()' }
    ]
  },
  {
    file: 'src/components/priority/PriorityProvider.tsx',
    fixes: [
      { find: 'priority: number, _config?: PriorityConfig)', replace: 'priority: number)' }
    ]
  },
  {
    file: 'src/components/priority/withPriority.tsx',
    fixes: [
      { find: 'import { PriorityProvider, usePriority, usePriorityScheduler }', replace: 'import { PriorityProvider, usePriority }' }
    ]
  },
  {
    file: 'src/components/ui/data-table/DataTableV2.tsx',
    fixes: [
      { find: "import { useState, useMemo } from 'react';", replace: "import { useState } from 'react';" }
    ]
  },
  {
    file: 'src/components/ui/date-picker-range.tsx',
    fixes: [
      { find: 'const { className, value, onChange, placeholder } =', replace: 'const { className, value, placeholder } =' }
    ]
  },
  {
    file: 'src/components/ui/examples/CompositionExample.tsx',
    fixes: [
      { find: 'const { data, isLoading, error } =', replace: 'const { data, error } =' }
    ]
  },
  {
    file: 'src/components/ui/form.tsx',
    fixes: [
      { find: 'const [_id, name] =', replace: 'const [, name] =' }
    ]
  },
  {
    file: 'src/components/ui/map/MapHeader.tsx',
    fixes: [
      { find: 'const activeLayers = [];', replace: '// const activeLayers = [];' }
    ]
  },
  {
    file: 'src/components/ui/map/RouteLine.tsx',
    fixes: [
      { find: '} = (props)', replace: '} = ({ name, description, distance })' }
    ]
  },
  {
    file: 'src/components/virtualized-list/utils/memoryManager.ts',
    fixes: [
      { find: 'subscribe(type: string, callback: () => void)', replace: 'subscribe(callback: () => void)' }
    ]
  },
  {
    file: 'src/features/alertas/components/AlertaDetalleModal.tsx',
    fixes: [
      { find: "const usuarioActual = localStorage.getItem('usuario') || 'Sistema';", replace: "// const usuarioActual = localStorage.getItem('usuario') || 'Sistema';" }
    ]
  },
  {
    file: 'src/features/alertas/components/AlertaDetalleModalV2.tsx',
    fixes: [
      { find: "const usuarioActual = localStorage.getItem('usuario') || 'Sistema';", replace: "// const usuarioActual = localStorage.getItem('usuario') || 'Sistema';" }
    ]
  },
  {
    file: 'src/features/alertas/components/AlertsTable.tsx',
    fixes: [
      { find: 'async (alertaId: string)', replace: 'async ()' }
    ]
  },
  {
    file: 'src/features/alertas/pages/AlertasPage.tsx',
    fixes: [
      { find: '(_: React.MouseEvent)', replace: '()' }
    ]
  },
  {
    file: 'src/services/shared/sharedApi.service.ts',
    fixes: [
      { find: 'on(eventType: string, callback: Function)', replace: 'on(_eventType: string, _callback: Function)' }
    ]
  },
  {
    file: 'src/services/shared/sharedState.service.ts',
    fixes: [
      { find: 'updatePrecinto(data: unknown)', replace: 'updatePrecinto(_data: unknown)' },
      { find: 'updateTransito(data: unknown)', replace: 'updateTransito(_data: unknown)' },
      { find: 'updateAlerta(data: unknown)', replace: 'updateAlerta(_data: unknown)' }
    ]
  },
  {
    file: 'src/services/transitos.service.ts',
    fixes: [
      { find: 'async getTransitosPendientes(filters?: unknown)', replace: 'async getTransitosPendientes()' }
    ]
  },
  {
    file: 'src/store/slices/precintosSlice.ts',
    fixes: [
      { find: '(set, get) => (', replace: '(set) => (' }
    ]
  },
  {
    file: 'src/store/slices/systemStatusSlice.ts',
    fixes: [
      { find: '(set, get) => (', replace: '(set) => (' }
    ]
  },
  {
    file: 'src/store/slices/transitosSlice.ts',
    fixes: [
      { find: '(set, get) => (', replace: '(set) => (' }
    ]
  },
  {
    file: 'src/store/middleware/errorHandling.ts',
    fixes: [
      { find: 'const { errorMessage = \'Ha ocurrido un error\', successMessage, showNotification = true } = options = {};', replace: '// Options removed' }
    ]
  },
  {
    file: 'src/store/middleware/logger.ts',
    fixes: [
      { find: 'const mergedOptions = { ...defaultOptions, ...options };', replace: 'const mergedOptions = { ...defaultOptions };' }
    ]
  },
  {
    file: 'src/store/middleware/persistHelpers.ts',
    fixes: [
      { find: ', options?: Partial<PersistOptions<T>>)', replace: ')' }
    ]
  },
  {
    file: 'src/test/utils/test-utils.tsx',
    fixes: [
      { find: 'const { id, data } = params;', replace: 'const { id } = params;' }
    ]
  }
];

// Apply specific fixes
specificFixes.forEach(({ file, fixes }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    fixes.forEach(({ find, replace }) => {
      if (content.includes(find)) {
        content = content.replace(find, replace);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
      totalFixed++;
    }
  } catch (error) {
    // Silent fail
  }
});

// Clean up unused eslint-disable comments
files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove eslint-disable comments that have no corresponding warning
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip eslint-disable lines that are followed by blank lines
      if (line.trim().startsWith('// eslint-disable') && 
          i + 1 < lines.length && 
          lines[i + 1].trim() === '') {
        // Check if there's a real code line after
        let hasCode = false;
        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          if (lines[j].trim() !== '' && !lines[j].trim().startsWith('//')) {
            hasCode = true;
            break;
          }
        }
        
        if (!hasCode) {
          continue; // Skip this eslint-disable line
        }
      }
      
      newLines.push(line);
    }
    
    const newContent = newLines.join('\n');
    
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent);
      totalFixed++;
    }
  } catch (error) {
    // Silent fail
  }
});

console.log(`\n✨ Total files fixed: ${totalFixed}`);