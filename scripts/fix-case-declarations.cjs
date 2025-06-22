#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing case declarations and remaining errors...');

// Map of specific files and their fixes
const fileFixes = [
  // Fix useWebSocket.ts - fix remaining issues
  {
    file: 'src/services/websocket/useWebSocket.ts',
    fixes: [
      {
        find: /case 'delete': {\s*store\.removePrecinto\(data\.precinto\.id\);\s*break;\s*}/,
        replace: `case 'delete': {
          store.removePrecinto(data.precinto.id);
          break;
        }`
      },
      {
        find: /}\s*case 'precintado': {/,
        replace: `}
        case 'precintado': {`
      },
      {
        find: /store\.updateSystemStatus\(_data\);/,
        replace: 'store.updateSystemStatus(data);'
      }
    ]
  },
  
  // Fix alerts in various hooks
  {
    file: 'src/hooks/useWebSocket.ts',
    fixes: [
      {
        find: /const\s*{\s*autoConnect\s*=\s*true,\s*onConnect,\s*onDisconnect,\s*onReconnect\s*}\s*=\s*options;/,
        replace: 'const { autoConnect = true, onConnect, onDisconnect, onReconnect } = options;'
      }
    ]
  },
  
  // Fix dataQualityService.ts imports
  {
    file: 'src/services/dataQualityService.ts',
    fixes: [
      {
        find: /import\s*{\s*Alerta,\s*Transitov2,\s*PrecintoStatus\s*}\s*from/,
        replace: 'import { Transitov2, PrecintoStatus } from'
      }
    ]
  },
  
  // Fix transitosSlice.ts
  {
    file: 'src/store/slices/transitosSlice.ts',
    fixes: [
      {
        find: /export const createTransitosSlice: StateCreator<TransitosState> = \(set, get\) => \(/,
        replace: 'export const createTransitosSlice: StateCreator<TransitosState> = (set) => ('
      }
    ]
  },
  
  // Fix alertasSlice.ts error handling
  {
    file: 'src/store/slices/alertasSlice.ts',
    fixes: [
      {
        find: /error\.message \|\| 'Error desconocido'/g,
        replace: '(error as Error).message || \'Error desconocido\''
      }
    ]
  },
  
  // Fix dashboard components
  {
    file: 'src/features/dashboard/pages/DashboardPage.tsx',
    fixes: [
      {
        find: /const\s*{\s*data:\s*precintosData,\s*loading:\s*precintosLoading,\s*error:\s*precintosError\s*}\s*=/,
        replace: 'const { data: precintosData, loading: precintosLoading } ='
      },
      {
        find: /const\s*{\s*data:\s*transitosData,\s*loading:\s*transitosLoading,\s*error:\s*transitosError\s*}\s*=/,
        replace: 'const { data: transitosData, loading: transitosLoading } ='
      },
      {
        find: /const\s*{\s*data:\s*alertasData,\s*loading:\s*alertasLoading,\s*error:\s*alertasError\s*}\s*=/,
        replace: 'const { data: alertasData } ='
      }
    ]
  },
  
  // Fix AlertasTreemap.tsx
  {
    file: 'src/features/analytics/components/treemap/AlertasTreemap.tsx',
    fixes: [
      {
        find: /interface TreemapData {[^}]+}/s,
        replace: `interface TreemapData {
  name: string;
  value: number;
  color?: string;
  children?: TreemapData[];
}`
      }
    ]
  },
  
  // Fix ArmFormCompact.tsx
  {
    file: 'src/features/armado/components/ArmFormCompact.tsx',
    fixes: [
      {
        find: /interface FormData {[^}]+}/s,
        replace: `interface FormData {
  codigo: string;
  tipo: string;
  [key: string]: unknown;
}`
      }
    ]
  },
  
  // Fix performance utils
  {
    file: 'src/utils/performance.ts',
    fixes: [
      {
        find: /<T extends \(...args: any\[\]\) => any>/g,
        replace: '<T extends (...args: any[]) => any>'
      },
      {
        find: /getKey\?: \(...args: Parameters<T>\) => string/g,
        replace: 'getKey?: (...args: Parameters<T>) => string'
      }
    ]
  },
  
  // Fix StatsService.tsx
  {
    file: 'src/features/statistics/services/StatsService.tsx',
    fixes: [
      {
        find: /const\s+monthlyGrowth\s*=[^;]+;/,
        replace: '// const monthlyGrowth removed - unused'
      }
    ]
  },
  
  // Fix PerformanceAnalyzer.tsx
  {
    file: 'src/features/performance/components/PerformanceAnalyzer.tsx',
    fixes: [
      {
        find: /interface MetricData {\s*time:\s*Date;\s*cpu:\s*number;\s*memory:\s*number;\s*latency:\s*number;\s*}/,
        replace: `interface MetricData {
  time: Date;
  cpu: number;
  memory: number;
  latency: number;
  [key: string]: unknown;
}`
      }
    ]
  },
  
  // Fix SankeyChart.tsx
  {
    file: 'src/components/charts/sankey/SankeyChart.tsx',
    fixes: [
      {
        find: /const\s+linkData\s*=[^;]+;/,
        replace: '// const linkData removed - unused'
      }
    ]
  },
  
  // Fix InteractiveTreemap.tsx in charts
  {
    file: 'src/components/charts/treemap/InteractiveTreemap.tsx',
    fixes: [
      {
        find: /const\s+totalValue\s*=[^;]+;/,
        replace: '// const totalValue removed - unused'
      }
    ]
  },
  
  // Fix ActivityHeatmap.tsx
  {
    file: 'src/components/charts/d3/ActivityHeatmap.tsx',
    fixes: [
      {
        find: /const\s+maxValue\s*=[^;]+;/,
        replace: '// const maxValue removed - unused'
      }
    ]
  },
  
  // Fix NetworkGraph.tsx
  {
    file: 'src/components/charts/d3/NetworkGraph.tsx',
    fixes: [
      {
        find: /const\s+nodeRadius\s*=[^;]+;/,
        replace: '// const nodeRadius removed - unused'
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

// Additional fixes for any types
console.log('\n🔍 Applying any type fixes...');

const glob = require('glob');
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
});

let anyFixCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace remaining 'any' types with 'unknown' where safe
    content = content.replace(/:\s*any(\s|;|,|\)|>|\[|\])/g, (match) => {
      // Don't replace in certain contexts
      if (content.includes('props: any') && filePath.includes('performance.ts')) {
        return match;
      }
      return match.replace('any', 'unknown');
    });
    
    // Fix Record<string, any>
    content = content.replace(/Record<string,\s*any>/g, 'Record<string, unknown>');
    
    // Fix any[] arrays
    content = content.replace(/:\s*any\[\]/g, ': unknown[]');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      anyFixCount++;
    }
  } catch (error) {
    // Silent fail
  }
});

console.log(`✨ Fixed ${anyFixCount} files with any type replacements`);