#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing more unused variable errors...');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
});

let fixedCount = 0;

// Common patterns to fix
const patterns = [
  // Remove unused imports
  {
    pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g,
    fix: (match, imports, from) => {
      // Parse imports
      const importList = imports.split(',').map(i => i.trim());
      const usedImports = [];
      
      // Check if each import is used in the file
      importList.forEach(imp => {
        const importName = imp.split(' as ')[0].trim();
        const restOfFile = match.substring(match.indexOf('\n'));
        
        // Simple check - might need refinement
        if (restOfFile.includes(importName)) {
          usedImports.push(imp);
        }
      });
      
      if (usedImports.length === 0) {
        return ''; // Remove entire import
      } else if (usedImports.length < importList.length) {
        return `import { ${usedImports.join(', ')} } from '${from}'`;
      }
      
      return match;
    }
  },
  
  // Prefix unused parameters with underscore
  {
    pattern: /\b(\w+)\s+is defined but never used/g,
    fix: (match, varName, content) => {
      // Add underscore prefix
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      return content.replace(regex, `_${varName}`);
    }
  },
  
  // Comment out unused const declarations
  {
    pattern: /const\s+(\w+)\s*=\s*([^;]+);/g,
    fix: (match, varName, value, content) => {
      // Check if variable is used later in the file
      const afterDeclaration = content.substring(content.indexOf(match) + match.length);
      if (!afterDeclaration.includes(varName)) {
        return `// ${match} // Removed - unused`;
      }
      return match;
    }
  }
];

// Specific file fixes
const specificFixes = [
  {
    file: 'src/services/notifications/soundService.ts',
    fixes: [
      { find: /} catch \(error\) {/, replace: '} catch (_error) {' },
      { find: /setVolume\(volume: number\)/, replace: 'setVolume(_volume: number)' }
    ]
  },
  {
    file: 'src/services/notifications/groupingService.ts',
    fixes: [
      { find: /cleanupStaleGroups\(notification: Notification\)/, replace: 'cleanupStaleGroups()' }
    ]
  },
  {
    file: 'src/services/notifications/notificationService.ts',
    fixes: [
      { find: /payload: unknown/, replace: '_payload: unknown' }
    ]
  },
  {
    file: 'src/services/notifications/pushNotificationService.ts',
    fixes: [
      { find: /removeSubscription\(notification: Notification\)/, replace: 'removeSubscription()' }
    ]
  },
  {
    file: 'src/features/analytics/components/DeploymentImpactFlow.tsx',
    fixes: [
      { find: /nodes: SankeyNode\[\]/, replace: '_nodes: SankeyNode[]' },
      { find: /links: SankeyLink\[\]/, replace: '_links: SankeyLink[]' }
    ]
  },
  {
    file: 'src/features/analytics/components/NormalFlowVisualization.tsx',
    fixes: [
      { find: /data: FlowData/, replace: '_data: FlowData' }
    ]
  },
  {
    file: 'src/features/analytics/components/SecurityAlertFlow.tsx',
    fixes: [
      { find: /config: FlowConfig/, replace: '_config: FlowConfig' }
    ]
  },
  {
    file: 'src/features/analytics/components/SystemHealthFlow.tsx',
    fixes: [
      { find: /config: FlowConfig/, replace: '_config: FlowConfig' }
    ]
  },
  {
    file: 'src/features/camioneros/components/FormularioCamionero.tsx',
    fixes: [
      { find: /const \[error, setError\] = useState/, replace: 'const [_error, _setError] = useState' }
    ]
  },
  {
    file: 'src/features/common/hooks/usePollingIntegration.tsx',
    fixes: [
      { find: /updateInterval: number/, replace: '_updateInterval: number' }
    ]
  },
  {
    file: 'src/features/dashboard/components/Dashboard.tsx',
    fixes: [
      { find: /alertasLoading: boolean/, replace: '_alertasLoading: boolean' }
    ]
  },
  {
    file: 'src/features/depositos/pages/DepositosPageV2.tsx',
    fixes: [
      { find: /const \[error, setError\] = useState/, replace: 'const [_error, _setError] = useState' }
    ]
  },
  {
    file: 'src/features/microinteractions/components/ParticleTrail.tsx',
    fixes: [
      { find: /particles: Particle\[\]/, replace: '_particles: Particle[]' }
    ]
  },
  {
    file: 'src/features/modo-tv/components/TransitosCriticos.tsx',
    fixes: [
      { find: /interval: NodeJS.Timeout/, replace: '_interval: NodeJS.Timeout' }
    ]
  },
  {
    file: 'src/features/performance/components/PerformanceAnalyzer.tsx',
    fixes: [
      { find: /frameId: number/, replace: '_frameId: number' }
    ]
  },
  {
    file: 'src/hooks/useWebSocketIntegration.ts',
    fixes: [
      { find: /error: Error \| null/, replace: '_error: Error | null' }
    ]
  },
  {
    file: 'src/hooks/useWebWorker.ts',
    fixes: [
      { find: /data: T/, replace: '_data: T' }
    ]
  },
  {
    file: 'src/services/api/trokor.service.ts',
    fixes: [
      { find: /error: unknown/, replace: '_error: unknown' }
    ]
  },
  {
    file: 'src/services/integrations/chat.service.ts',
    fixes: [
      { find: /userId: string/, replace: '_userId: string' }
    ]
  },
  {
    file: 'src/services/integrations/graphql.service.ts',
    fixes: [
      { find: /variables: Record<string, unknown>/, replace: '_variables: Record<string, unknown>' }
    ]
  },
  {
    file: 'src/services/integrations/rest-api.service.ts',
    fixes: [
      { find: /config: APIConfig/, replace: '_config: APIConfig' }
    ]
  },
  {
    file: 'src/services/integrations/ticketing.service.ts',
    fixes: [
      { find: /ticketId: string/, replace: '_ticketId: string' }
    ]
  },
  {
    file: 'src/services/integrations/webhooks.service.ts',
    fixes: [
      { find: /webhookId: string/, replace: '_webhookId: string' }
    ]
  },
  {
    file: 'src/services/shared/auth.service.ts',
    fixes: [
      { find: /import { hasRole }/, replace: '// import { hasRole }' }
    ]
  },
  {
    file: 'src/services/shared/sharedApi.service.ts',
    fixes: [
      { find: /on\(eventType: string, callback: Function\)/, replace: 'on(_eventType: string, _callback: Function)' }
    ]
  },
  {
    file: 'src/services/shared/sharedState.service.ts',
    fixes: [
      { find: /updatePrecinto\(data: unknown\)/, replace: 'updatePrecinto(_data: unknown)' },
      { find: /updateTransito\(data: unknown\)/, replace: 'updateTransito(_data: unknown)' },
      { find: /updateAlerta\(data: unknown\)/, replace: 'updateAlerta(_data: unknown)' }
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
      if (find instanceof RegExp) {
        const newContent = content.replace(find, replace);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      } else if (content.includes(find)) {
        content = content.replace(find, replace);
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

console.log(`\n✨ Fixed ${fixedCount} files with unused variables`);