#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing parsing errors in TypeScript files...');

const fixes = [
  // Fix useWebSocket.ts - missing closing brace in switch
  {
    file: 'src/services/websocket/useWebSocket.ts',
    fix: (content) => {
      // Fix the switch statement missing closing brace
      const lines = content.split('\n');
      let switchDepth = 0;
      let inPrecintoSwitch = false;
      let inTransitoSwitch = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Track when we're in the precinto switch
        if (line.includes('switch (data.action)') && lines[i-2] && lines[i-2].includes('onPrecintoUpdate')) {
          inPrecintoSwitch = true;
          switchDepth++;
        }
        
        // Track when we're in the transito switch
        if (line.includes('switch (data.action)') && lines[i-2] && lines[i-2].includes('onTransitoUpdate')) {
          inTransitoSwitch = true;
          switchDepth++;
        }
        
        // Fix missing closing brace after delete case
        if (inPrecintoSwitch && line.trim() === '}' && lines[i+1].trim() === '});') {
          lines[i] = '      }\n    }';
          inPrecintoSwitch = false;
        }
        
        // Fix the transito switch - add missing closing brace
        if (inTransitoSwitch && line.trim() === '}' && lines[i+1] && lines[i+1].includes('case \'precintado\'')) {
          lines[i] = '        }';
          lines.splice(i+1, 0, '        case \'precintado\': {');
          inTransitoSwitch = false;
        }
      }
      
      return lines.join('\n');
    }
  },
  
  // Fix VirtualizedList.tsx parsing error
  {
    file: 'src/components/optimized/VirtualizedList.tsx',
    fix: (content) => {
      // Fix <<T,>> to <T>
      return content.replace(/<<T,>>/g, '<T>');
    }
  },
  
  // Fix VirtualizedAlertList.tsx
  {
    file: 'src/components/virtualized-list/VirtualizedAlertList.tsx',
    fix: (content) => {
      // Remove trailing semicolons after closing braces
      return content.replace(/}\s*;\s*$/gm, '}');
    }
  },
  
  // Fix useAlertFiltering.ts
  {
    file: 'src/components/virtualized-list/hooks/useAlertFiltering.ts',
    fix: (content) => {
      // Fix indentation issues
      const lines = content.split('\n');
      let inFunction = false;
      let braceCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Count braces
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        // Fix standalone closing braces with wrong indentation
        if (line.trim() === '}' && braceCount === 0) {
          lines[i] = '}';
        } else if (line.trim() === '}' && braceCount === 1) {
          lines[i] = '  }';
        }
      }
      
      return lines.join('\n');
    }
  },
  
  // Fix optimizedUtils.ts - conditional hook
  {
    file: 'src/components/optimized/optimizedUtils.ts',
    fix: (content) => {
      // Rewrite the useOptimizedData function to not conditionally call hooks
      const newFunction = `export function useOptimizedData<T>(data: T[], options?: OptimizationOptions): T[] {
  const deps = options?.dependencies || [];
  
  return useMemo(() => {
    if (!options) return data;
    
    let result = [...data];
    
    if (options.sortBy) {
      result = result.sort((a, b) => {
        const aVal = (a as any)[options.sortBy!];
        const bVal = (b as any)[options.sortBy!];
        return aVal > bVal ? 1 : -1;
      });
    }
    
    if (options.filterBy) {
      result = result.filter(item => (item as any)[options.filterBy!.key] === options.filterBy!.value);
    }
    
    if (options.limit) {
      result = result.slice(0, options.limit);
    }
    
    return result;
  }, [data, options?.sortBy, options?.filterBy?.key, options?.filterBy?.value, options?.limit, ...deps]);
}`;
      
      // Replace the existing function
      const functionStart = content.indexOf('export function useOptimizedData');
      const functionEnd = content.indexOf('\n}', functionStart) + 2;
      
      if (functionStart !== -1 && functionEnd > functionStart) {
        return content.substring(0, functionStart) + newFunction + content.substring(functionEnd);
      }
      
      return content;
    }
  }
];

// Process each fix
fixes.forEach(({ file, fix }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fix(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ Parsing errors fixed!');