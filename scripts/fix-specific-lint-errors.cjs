#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing specific lint errors...');

// Map of files and their specific fixes
const specificFixes = [
  {
    file: 'src/components/charts/d3/ActivityHeatmap.tsx',
    fixes: [
      { 
        find: /const\s*{\s*data,\s*dimensions,\s*entries\s*}\s*=\s*props;/,
        replace: 'const { data, dimensions } = props;'
      }
    ]
  },
  {
    file: 'src/components/charts/d3/InteractiveLineChart.tsx',
    fixes: [
      {
        find: /const\s*{\s*data,\s*dimensions,\s*entries\s*}\s*=\s*props;/,
        replace: 'const { data, dimensions } = props;'
      },
      {
        find: /\.on\('mousemove',\s*\(event\)\s*=>\s*{/g,
        replace: '.on(\'mousemove\', () => {'
      }
    ]
  },
  {
    file: 'src/components/charts/d3/InteractiveTreemap.tsx',
    fixes: [
      {
        find: /const\s*{\s*data,\s*dimensions,\s*entries\s*}\s*=\s*props;/,
        replace: 'const { data, dimensions } = props;'
      }
    ]
  },
  {
    file: 'src/components/charts/d3/NetworkGraph.tsx',
    fixes: [
      {
        find: /const\s*{\s*data,\s*dimensions,\s*entries,\s*selectedNode\s*}\s*=\s*props;/,
        replace: 'const { data, dimensions, selectedNode } = props;'
      }
    ]
  },
  {
    file: 'src/components/charts/sankey/SankeyChart.tsx',
    fixes: [
      {
        find: /const\s*\[\s*_hoveredLink,\s*setHoveredLink\s*\]/,
        replace: 'const [, setHoveredLink]'
      },
      {
        find: /sankeyLink<Node,\s*Link,\s*_N,\s*_L>\(\)/,
        replace: 'sankeyLink<Node, Link>()'
      },
      {
        find: /interface Node extends _N \{/,
        replace: 'interface Node {'
      },
      {
        find: /interface Link extends _L \{/,
        replace: 'interface Link {'
      }
    ]
  },
  {
    file: 'src/components/map/MapRenderer.tsx',
    fixes: [
      {
        find: /const\s*{\s*precintos,\s*_center,\s*onPrecintoClick\s*}\s*=/,
        replace: 'const { precintos, onPrecintoClick } ='
      }
    ]
  },
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
    file: 'src/components/maps/InteractiveMap.tsx',
    fixes: [
      {
        find: /const\s*{\s*_routes,\s*_center,\s*precintos[^}]*_mapType\s*}\s*=/,
        replace: 'const { precintos, showControls = true, height = "100%", onMarkerClick, selectedPrecinto } ='
      }
    ]
  },
  {
    file: 'src/components/notifications/NotificationCenter.tsx',
    fixes: [
      {
        find: /onToggle\?:\s*\(\)\s*=>\s*void;/,
        replace: '// onToggle removed - unused'
      },
      {
        find: /const NotificationCenter:\s*React\.FC<{\s*onToggle\?:\s*\(\)\s*=>\s*void;\s*}>\s*=\s*\(\s*{\s*onToggle\s*}\s*\)/,
        replace: 'const NotificationCenter: React.FC = ()'
      }
    ]
  },
  {
    file: 'src/components/notifications/NotificationPreferences.tsx',
    fixes: [
      {
        find: /setActiveTab\(key as any\)/,
        replace: 'setActiveTab(key as \'channels\' | \'types\' | \'sounds\' | \'schedule\')'
      }
    ]
  },
  {
    file: 'src/components/optimized/VirtualizedList.tsx',
    fixes: [
      {
        find: /<<T,>>/g,
        replace: '<T>'
      }
    ]
  },
  {
    file: 'src/components/priority/PriorityProvider.tsx',
    fixes: [
      {
        find: /const\s*updatePriority\s*=\s*\(\s*id:\s*string,\s*priority:\s*number,\s*_config\?:\s*PriorityConfig\s*\)/,
        replace: 'const updatePriority = (id: string, priority: number)'
      }
    ]
  },
  {
    file: 'src/components/priority/withPriority.tsx',
    fixes: [
      {
        find: /export function withPriority<P extends object>\(Component: React\.ComponentType<P>, options\?: WithPriorityOptions\)/,
        replace: 'export function withPriority<P extends object>(Component: React.ComponentType<P>)'
      },
      {
        find: /const\s*\[\s*_isPending,\s*startTransition\s*\]/,
        replace: 'const [, startTransition]'
      }
    ]
  },
  {
    file: 'src/components/ui/FeedbackInput.tsx',
    fixes: [
      {
        find: /} catch \(_error\) {/g,
        replace: '} catch {'
      }
    ]
  },
  {
    file: 'src/services/websocket/useWebSocket.ts',
    fixes: [
      {
        find: /^\s*}\s*$/m,
        replace: '  }',
        line: 84
      }
    ]
  },
  {
    file: 'src/features/transitos/pages/TransitosPageV2.tsx',
    fixes: [
      {
        find: /case 'activos':\s*filtered = transitosEnCurso;\s*}/,
        replace: 'case \'activos\':\n        filtered = transitosEnCurso;\n        break;'
      },
      {
        find: /case 'pendientes':\s*filtered = transitosPendientes;\s*}/,
        replace: 'case \'pendientes\':\n        filtered = transitosPendientes;\n        break;'
      },
      {
        find: /case 'completados':\s*filtered = transitosCompletados;\s*}/,
        replace: 'case \'completados\':\n        filtered = transitosCompletados;\n        break;'
      },
      {
        find: /case 'hoy':\s*if \(fecha\.toDateString\(\) !== ahora\.toDateString\(\)\) return false;\s*}/,
        replace: 'case \'hoy\':\n            if (fecha.toDateString() !== ahora.toDateString()) return false;\n            break;'
      },
      {
        find: /case 'semana': {\s*const unaSemanaAtras[^}]+}\s*}/,
        replace: 'case \'semana\': {\n            const unaSemanaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);\n            if (fecha < unaSemanaAtras) return false;\n            break;\n          }'
      }
    ]
  },
  {
    file: 'src/features/alertas/pages/AlertasPageV2.tsx',
    fixes: [
      {
        find: /const { filteredAlertas, totalPages, totalItems } = React\.useMemo\(\(\) => {/,
        replace: 'const { filteredAlertas, totalPages, totalItems } = React.useMemo(() => {\n    let filtered = alertas;'
      }
    ]
  },
  {
    file: 'src/features/novedades/pages/BitacoraOperacional.tsx',
    fixes: [
      {
        find: /const \[novedades, loading, fetchNovedades, crearNovedad, agregarSeguimiento\] = useNovedadesStore\(state => \[/,
        replace: 'const novedades = useNovedadesStore(state => state.novedades);\n  const loading = useNovedadesStore(state => state.loading);\n  const fetchNovedades = useNovedadesStore(state => state.fetchNovedades);\n  const crearNovedad = useNovedadesStore(state => state.crearNovedad);\n  const agregarSeguimiento = useNovedadesStore(state => state.agregarSeguimiento);'
      }
    ]
  },
  {
    file: 'src/features/documentacion/components/CentroDocumentacion.tsx',
    fixes: [
      {
        find: /const \[documentos, loading, estadisticas, fetchDocumentos, uploadDocumento, deleteDocumento\] = useDocumentosStore\(state => \[/,
        replace: 'const documentos = useDocumentosStore(state => state.documentos);\n  const loading = useDocumentosStore(state => state.loading);\n  const estadisticas = useDocumentosStore(state => state.estadisticas);\n  const fetchDocumentos = useDocumentosStore(state => state.fetchDocumentos);\n  const uploadDocumento = useDocumentosStore(state => state.uploadDocumento);\n  const deleteDocumento = useDocumentosStore(state => state.deleteDocumento);'
      }
    ]
  }
];

// Process files
let fixedCount = 0;
specificFixes.forEach(({ file, fixes }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    fixes.forEach(fix => {
      if (fix.line) {
        // Line-specific fix
        const lines = content.split('\n');
        if (lines[fix.line - 1] && fix.find.test(lines[fix.line - 1])) {
          lines[fix.line - 1] = lines[fix.line - 1].replace(fix.find, fix.replace);
          content = lines.join('\n');
          hasChanges = true;
        }
      } else {
        // Global fix
        const newContent = content.replace(fix.find, fix.replace);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
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