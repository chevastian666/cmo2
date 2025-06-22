#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing unused variable errors...');

// Map of files and their specific unused variable fixes
const unusedVarFixes = [
  {
    file: 'src/components/map/MapView.tsx',
    fixes: [
      {
        find: /import React, { memo } from 'react';/,
        replace: 'import React from \'react\';'
      }
    ]
  },
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
  {
    file: 'src/components/ui/TransitCard.tsx',
    fixes: [
      {
        find: /} catch \(_error\) {/g,
        replace: '} catch {'
      }
    ]
  },
  {
    file: 'src/features/novedades/pages/BitacoraOperacional.tsx',
    fixes: [
      {
        find: /const\s+\[novedades,\s*loading,\s*fetchNovedades,\s*crearNovedad,\s*agregarSeguimiento\]\s*=\s*useNovedadesStore[^;]+;/,
        replace: `const novedades = useNovedadesStore(state => state.novedades);
  const loading = useNovedadesStore(state => state.loading);
  const fetchNovedades = useNovedadesStore(state => state.fetchNovedades);
  const crearNovedad = useNovedadesStore(state => state.crearNovedad);
  const agregarSeguimiento = useNovedadesStore(state => state.agregarSeguimiento);`
      }
    ]
  },
  {
    file: 'src/features/documentacion/components/CentroDocumentacion.tsx',
    fixes: [
      {
        find: /const\s+\[documentos,\s*loading,\s*estadisticas,\s*fetchDocumentos,\s*uploadDocumento,\s*deleteDocumento\]\s*=\s*useDocumentosStore[^;]+;/,
        replace: `const documentos = useDocumentosStore(state => state.documentos);
  const loading = useDocumentosStore(state => state.loading);
  const estadisticas = useDocumentosStore(state => state.estadisticas);
  const fetchDocumentos = useDocumentosStore(state => state.fetchDocumentos);
  const uploadDocumento = useDocumentosStore(state => state.uploadDocumento);
  const deleteDocumento = useDocumentosStore(state => state.deleteDocumento);`
      }
    ]
  },
  {
    file: 'src/features/configuracion/components/ConfiguracionPage.tsx',
    fixes: [
      {
        find: /} catch \(_error\) {/g,
        replace: '} catch {'
      }
    ]
  },
  {
    file: 'src/hooks/useRealTimeData.ts',
    fixes: [
      {
        find: /const\s+subscribe\s*=\s*\(\s*eventType:\s*string,\s*callback:\s*\([^)]+\)\s*=>\s*void\s*\)/,
        replace: 'const subscribe = ()'
      }
    ]
  },
  {
    file: 'src/services/shared/notification.service.ts',
    fixes: [
      {
        find: /const\s+subscribe\s*=\s*\(\s*eventType:\s*string,\s*callback:\s*\([^)]+\)\s*=>\s*void\s*\)/,
        replace: 'const subscribe = ()'
      }
    ]
  },
  {
    file: 'src/services/shared/sharedState.service.ts',
    fixes: [
      {
        find: /updateAlertas\(data:[^)]+\)/g,
        replace: 'updateAlertas()'
      },
      {
        find: /updatePrecintos\(data:[^)]+\)/g,
        replace: 'updatePrecintos()'
      },
      {
        find: /updateSystemMetrics\(data:[^)]+\)/g,
        replace: 'updateSystemMetrics()'
      }
    ]
  },
  {
    file: 'src/services/shared/sharedWebSocket.service.ts',
    fixes: [
      {
        find: /} catch \(_error\) {/g,
        replace: '} catch {'
      },
      {
        find: /handleMessage\(message:[^)]+\)/,
        replace: 'handleMessage()'
      }
    ]
  },
  {
    file: 'src/services/transitos.service.ts',
    fixes: [
      {
        find: /getTransitos\(filters\?:[^)]+\)/,
        replace: 'getTransitos()'
      }
    ]
  },
  {
    file: 'src/store/documentosStore.ts',
    fixes: [
      {
        find: /} catch \(_error\) {/g,
        replace: '} catch {'
      }
    ]
  },
  {
    file: 'src/store/novedadesStore.ts',
    fixes: [
      {
        find: /} catch \(_error\) {/g,
        replace: '} catch {'
      }
    ]
  },
  {
    file: 'src/store/rolesStore.ts',
    fixes: [
      {
        find: /} catch \(_error\) {/g,
        replace: '} catch {'
      }
    ]
  },
  {
    file: 'src/store/slices/precintosSlice.ts',
    fixes: [
      {
        find: /export const createPrecintosSlice = \(set: SetState<[^>]+>, get: GetState<[^>]+>\)/,
        replace: 'export const createPrecintosSlice = (set: SetState<AppStore>)'
      }
    ]
  },
  {
    file: 'src/store/slices/systemStatusSlice.ts',
    fixes: [
      {
        find: /export const createSystemStatusSlice = \(set: SetState<[^>]+>, get: GetState<[^>]+>\)/,
        replace: 'export const createSystemStatusSlice = (set: SetState<AppStore>)'
      }
    ]
  },
  {
    file: 'src/store/tenantStore.ts',
    fixes: [
      {
        find: /} catch \(_error\) {/g,
        replace: '} catch {'
      }
    ]
  },
  {
    file: 'src/store/middleware/errorHandling.ts',
    fixes: [
      {
        find: /options\s*=\s*{}/,
        replace: '// options removed - unused'
      }
    ]
  },
  {
    file: 'src/store/middleware/logger.ts',
    fixes: [
      {
        find: /const\s*{\s*enabled\s*=\s*true,\s*collapsed\s*=\s*true\s*}\s*=\s*options\s*\|\|\s*{};/,
        replace: 'const enabled = true;\n  const collapsed = true;'
      }
    ]
  },
  {
    file: 'src/store/middleware/persistHelpers.ts',
    fixes: [
      {
        find: /export function createPersistConfig<T>\(name: string, options\?: PersistOptions<T>\)/,
        replace: 'export function createPersistConfig<T>(name: string)'
      },
      {
        find: /} catch \(_error\) {/g,
        replace: '} catch {'
      }
    ]
  },
  {
    file: 'src/test/mocks/handlers.ts',
    fixes: [
      {
        find: /async \({ request }\) => {/g,
        replace: 'async () => {'
      }
    ]
  },
  {
    file: 'src/test/utils/test-utils.tsx',
    fixes: [
      {
        find: /data: unknown\[\];/,
        replace: '// data removed - unused'
      }
    ]
  },
  {
    file: 'src/utils/performance.ts',
    fixes: [
      {
        find: /ProfilerComponent:\s*React\.FC<{\s*id:\s*string;\s*_props\?:\s*unknown;\s*}>/,
        replace: 'ProfilerComponent: React.FC<{ id: string; }>'
      }
    ]
  }
];

// Process files
let fixedCount = 0;
unusedVarFixes.forEach(({ file, fixes }) => {
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