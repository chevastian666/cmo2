#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing specific file errors batch 3...');

// Fix each file individually
const fileFixes = [
  // Fix DataTableV2
  {
    file: 'src/components/ui/data-table/DataTableV2.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/components/ui/data-table/DataTableV2.tsx'), 'utf8')
      .replace("import { useState, useMemo } from 'react';", "import { useState } from 'react';")
  },
  
  // Fix date-picker-range
  {
    file: 'src/components/ui/date-picker-range.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/components/ui/date-picker-range.tsx'), 'utf8')
      .replace('onChange?: (date: DateRange | undefined) => void;', '')
      .replace('const { className, value, onChange, placeholder } =', 'const { className, value, placeholder } =')
  },
  
  // Fix CompositionExample
  {
    file: 'src/components/ui/examples/CompositionExample.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/components/ui/examples/CompositionExample.tsx'), 'utf8')
      .replace('const [isLoading, setIsLoading] = useState(false);', '')
      .replace('const { data, isLoading, error } =', 'const { data, error } =')
  },
  
  // Fix form.tsx
  {
    file: 'src/components/ui/form.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/components/ui/form.tsx'), 'utf8')
      .replace('const [_id, name] =', 'const [, name] =')
  },
  
  // Fix MapHeader
  {
    file: 'src/components/ui/map/MapHeader.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/components/ui/map/MapHeader.tsx'), 'utf8')
      .replace('const activeLayers = [];', '// const activeLayers = [];')
  },
  
  // Fix RouteLine
  {
    file: 'src/components/ui/map/RouteLine.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/components/ui/map/RouteLine.tsx'), 'utf8')
      .replace(
        'const RouteLinePopup: React.FC<{ name: string; description?: string; distance?: string; }> = (props)',
        'const RouteLinePopup: React.FC<{ name: string; description?: string; distance?: string; }> = ({ name, description, distance })'
      )
      .replace('{props.name}', '{name}')
      .replace('{props.description}', '{description}')
      .replace('{props.distance}', '{distance}')
  },
  
  // Fix VirtualizedAlertList
  {
    file: 'src/components/virtualized-list/VirtualizedAlertList.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/components/virtualized-list/VirtualizedAlertList.tsx'), 'utf8')
      .replace(/}\s*;\s*$/gm, '}')
  },
  
  // Fix useAlertFiltering
  {
    file: 'src/components/virtualized-list/hooks/useAlertFiltering.ts',
    content: (() => {
      const content = fs.readFileSync(path.join(process.cwd(), 'src/components/virtualized-list/hooks/useAlertFiltering.ts'), 'utf8');
      const lines = content.split('\n');
      
      // Find the last brace and ensure proper return
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() === '}' && lines[i-1].trim() === '}') {
          // Insert return statement before the last closing brace
          lines.splice(i, 0, '  ', '  return {', '    filteredItems,', '    activeFilters,', '    filterCounts,', '    updateFilter,', '    clearFilter,', '    clearAllFilters,', '    isFilterActive', '  };');
          break;
        }
      }
      
      return lines.join('\n');
    })()
  },
  
  // Fix memoryManager
  {
    file: 'src/components/virtualized-list/utils/memoryManager.ts',
    content: fs.readFileSync(path.join(process.cwd(), 'src/components/virtualized-list/utils/memoryManager.ts'), 'utf8')
      .replace('subscribe(type: string, callback: () => void)', 'subscribe(callback: () => void)')
  },
  
  // Fix prefetchStrategies
  {
    file: 'src/components/virtualized-list/utils/prefetchStrategies.ts',
    content: fs.readFileSync(path.join(process.cwd(), 'src/components/virtualized-list/utils/prefetchStrategies.ts'), 'utf8')
      .replace("case 'acceleration':\n        const acceleration =", "case 'acceleration': {\n        const acceleration =")
      .replace("return { start, end };\n      case 'intersection':", "return { start, end };\n      }\n      case 'intersection':")
  },
  
  // Fix AlertaDetalleModal
  {
    file: 'src/features/alertas/components/AlertaDetalleModal.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/features/alertas/components/AlertaDetalleModal.tsx'), 'utf8')
      .replace("const usuarioActual = localStorage.getItem('usuario') || 'Sistema';", "// const usuarioActual = localStorage.getItem('usuario') || 'Sistema';")
  },
  
  // Fix AlertaDetalleModalV2
  {
    file: 'src/features/alertas/components/AlertaDetalleModalV2.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/features/alertas/components/AlertaDetalleModalV2.tsx'), 'utf8')
      .replace("const usuarioActual = localStorage.getItem('usuario') || 'Sistema';", "// const usuarioActual = localStorage.getItem('usuario') || 'Sistema';")
  },
  
  // Fix AlertsTable
  {
    file: 'src/features/alertas/components/AlertsTable.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/features/alertas/components/AlertsTable.tsx'), 'utf8')
      .replace('const handleAttendAlert = async (alertaId: string) => {', 'const handleAttendAlert = async () => {')
  },
  
  // Fix AlertasPage
  {
    file: 'src/features/alertas/pages/AlertasPage.tsx',
    content: fs.readFileSync(path.join(process.cwd(), 'src/features/alertas/pages/AlertasPage.tsx'), 'utf8')
      .replace('const handleClearAllFilters = (_: React.MouseEvent) => {', 'const handleClearAllFilters = () => {')
  },
  
  // Fix AlertasPageV2
  {
    file: 'src/features/alertas/pages/AlertasPageV2.tsx',
    content: (() => {
      let content = fs.readFileSync(path.join(process.cwd(), 'src/features/alertas/pages/AlertasPageV2.tsx'), 'utf8');
      
      // Fix any type
      content = content.replace(/variant:\s*alert\.severidad\s*as\s*any/g, "variant: (alert.severidad as 'critica' | 'alta' | 'media' | 'baja')");
      
      // Fix parsing error - find incomplete function
      const lines = content.split('\n');
      let braceCount = 0;
      let functionStart = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('export default function') || lines[i].includes('export function')) {
          functionStart = i;
          braceCount = 0;
        }
        
        if (functionStart >= 0) {
          braceCount += (lines[i].match(/{/g) || []).length;
          braceCount -= (lines[i].match(/}/g) || []).length;
          
          if (i === lines.length - 1 && braceCount > 0) {
            // Add missing closing braces
            while (braceCount > 0) {
              lines.push('}');
              braceCount--;
            }
          }
        }
      }
      
      return lines.join('\n');
    })()
  }
];

// Apply fixes
let fixedCount = 0;

fileFixes.forEach(({ file, content }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      return;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}`);
    fixedCount++;
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files`);