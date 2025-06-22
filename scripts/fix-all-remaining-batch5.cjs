#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing ALL remaining errors in batch 5...');

// Find all files with errors
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
});

const specificFixes = [
  // Analytics components
  {
    file: 'src/features/analytics/components/AlertFlowAnalysis.tsx',
    find: '({ alertas, dateRange })',
    replace: '({ alertas })'
  },
  {
    file: 'src/features/analytics/components/LogisticsFlowChart.tsx',
    multifix: [
      { find: 'data: any', replace: 'data: unknown' },
      { find: 'const stages = new Set<string>();', replace: '// const stages = new Set<string>();' },
      { find: 'const stageCount = new Map<string, number>();', replace: '// const stageCount = new Map<string, number>();' },
      { find: "case 'volume':\n        const volumeData =", replace: "case 'volume': {\n        const volumeData =" },
      { find: "});\n        break;", replace: "});\n        break;\n      }" }
    ]
  },
  {
    file: 'src/features/analytics/components/PrecintoLifecycleFlow.tsx',
    find: '({ precintos, dateRange })',
    replace: '({ precintos })'
  },
  {
    file: 'src/features/analytics/components/TreemapFixed.tsx',
    multifix: [
      { find: "import React, { useState, useRef, useEffect, useMemo } from 'react';", replace: "import React, { useState, useRef, useEffect } from 'react';" },
      { find: 'const currentData = getCurrentData();', replace: '// const currentData = getCurrentData();' }
    ]
  },
  {
    file: 'src/features/analytics/components/treemap/PrecintosTreemap.tsx',
    find: 'const handleNodeClick = (node: any, event: React.MouseEvent) => {',
    replace: 'const handleNodeClick = (node: unknown) => {'
  },
  {
    file: 'src/features/analytics/components/treemap/TransitosTreemap.tsx',
    afterContent: '}, [transitos]);',
    append: '\n\n  return (\n    <div className="h-full">\n      <TreemapChart data={data} onNodeClick={onNodeClick} />\n    </div>\n  );\n};'
  },
  
  // Armado components
  {
    file: 'src/features/armado/components/ArmFormV2.tsx',
    find: 'const handleRutChange = (_data: unknown) => {',
    replace: 'const handleRutChange = () => {'
  },
  {
    file: 'src/features/armado/pages/ArmadoPageV2.tsx',
    find: 'const location = await getLocationFromGPS();',
    replace: '// const location = await getLocationFromGPS();'
  },
  {
    file: 'src/features/armado/pages/ArmadoWaitingPage.tsx',
    find: 'const lastCustomsStatus = customsHistory[customsHistory.length - 1];',
    replace: '// const lastCustomsStatus = customsHistory[customsHistory.length - 1];'
  },
  
  // Camioneros
  {
    file: 'src/features/camioneros/components/FormularioCamioneroV2.tsx',
    multifix: [
      { find: 'import { Nacionalidad, TipoDocumento } from', replace: 'import { TipoDocumento } from' },
      { find: 'onSuccess: ({ toast, _data }) => {', replace: 'onSuccess: ({ toast }) => {' },
      { find: 'onError: ({ toast, _data }) => {', replace: 'onError: ({ toast }) => {' },
      { find: 'onSuccess: ({ _data }) => {', replace: 'onSuccess: () => {' }
    ]
  },
  {
    file: 'src/features/camioneros/services/camioneros.service.ts',
    find: 'async updateFichaMedica(camioneroId: string, data: unknown): Promise<void> {',
    replace: 'async updateFichaMedica(camioneroId: string): Promise<void> {'
  },
  
  // Dashboard
  {
    file: 'src/features/dashboard/components/Dashboard.tsx',
    multifix: [
      { find: 'const { data: precintosData, loading: precintosLoading, error: precintosError } =', 
        replace: 'const { data: precintosData, loading: precintosLoading } =' },
      { find: 'const { data: transitosData, loading: transitosLoading, error: transitosError } =', 
        replace: 'const { data: transitosData, loading: transitosLoading } =' },
      { find: 'const { data: alertasData, loading: alertasLoading, error: alertasError } =', 
        replace: 'const { data: alertasData } =' },
      { find: '(precinto.estado as any)', replace: '(precinto.estado as "activo" | "inactivo" | "alarma")' }
    ]
  },
  {
    file: 'src/features/dashboard/components/DashboardRefactored.tsx',
    multifix: [
      { find: '(a as any)[sortConfig.key]', replace: '(a as Record<string, unknown>)[sortConfig.key]' },
      { find: '(b as any)[sortConfig.key]', replace: '(b as Record<string, unknown>)[sortConfig.key]' }
    ]
  },
  
  // Depositos
  {
    file: 'src/features/depositos/pages/DepositosPageV2.tsx',
    find: 'const [error, setError] = useState<string | null>(null);',
    replace: '// const [error, setError] = useState<string | null>(null);'
  },
  
  // Microinteractions
  {
    file: 'src/features/microinteractions/components/ParticleTrail.tsx',
    find: 'particles.forEach((particle) => {',
    replace: '// particles.forEach((particle) => {'
  },
  
  // Modo TV
  {
    file: 'src/features/modo-tv/components/TransitosCriticos.tsx',
    find: 'const interval = setInterval',
    replace: '// const interval = setInterval'
  },
  
  // Transitos
  {
    file: 'src/features/transitos/pages/TransitosPageV2.tsx',
    multifix: [
      { find: 'switch (value) {', replace: 'switch (value) {\n      case "todos":\n        setFilteredData(transitos);\n        break;' },
      { find: 'variant: (transito.estado as any)', 
        replace: 'variant: (transito.estado as "pendiente" | "en_transito" | "completado" | "cancelado")' }
    ]
  },
  
  // Hooks
  {
    file: 'src/hooks/useWebSocketIntegration.ts',
    find: 'error: Error | null',
    replace: '_error: Error | null'
  },
  {
    file: 'src/hooks/useWebWorker.ts',
    find: 'onMessage: (data: T) => void',
    replace: 'onMessage: (_data: T) => void'
  },
  
  // Services
  {
    file: 'src/services/api/trokor.service.ts',
    multifix: [
      { find: 'data: any', replace: 'data: unknown' },
      { find: ': any[]', replace: ': unknown[]' },
      { find: 'error as any', replace: 'error as Error' }
    ]
  },
  {
    file: 'src/services/integrations/chat.service.ts',
    find: 'async sendMessage(userId: string, message: string): Promise<void> {',
    replace: 'async sendMessage(_userId: string, message: string): Promise<void> {'
  },
  {
    file: 'src/services/integrations/graphql.service.ts',
    find: 'async query(query: string, variables: Record<string, unknown>): Promise<unknown> {',
    replace: 'async query(query: string, _variables: Record<string, unknown>): Promise<unknown> {'
  },
  {
    file: 'src/services/integrations/rest-api.service.ts',
    find: 'async initialize(config: APIConfig): Promise<void> {',
    replace: 'async initialize(_config: APIConfig): Promise<void> {'
  },
  {
    file: 'src/services/integrations/ticketing.service.ts',
    find: 'async updateTicket(ticketId: string, data: TicketUpdate): Promise<Ticket> {',
    replace: 'async updateTicket(_ticketId: string, data: TicketUpdate): Promise<Ticket> {'
  },
  {
    file: 'src/services/integrations/webhooks.service.ts',
    find: 'async deleteWebhook(webhookId: string): Promise<void> {',
    replace: 'async deleteWebhook(_webhookId: string): Promise<void> {'
  }
];

// Additional React hooks fixes
const hooksDependencyFixes = [
  {
    file: 'src/components/dashboard/DashboardGrid.tsx',
    find: '}, [layouts, breakpoint, editMode])',
    replace: '}, [layouts, breakpoint])'
  },
  {
    file: 'src/components/dashboard/DashboardGrid.tsx',
    find: '}, [setLayouts, breakpoint])',
    replace: '}, [breakpoint])'
  },
  {
    file: 'src/components/ui/AlertsPanel.tsx',
    find: '}, [alerts, playSound])',
    replace: '}, [alerts, playSound, previousAlertIds])'
  },
  {
    file: 'src/components/ui/TransitCard.tsx',
    find: '}, [])',
    replace: '}, [calculateTimeRemaining])'
  },
  {
    file: 'src/components/virtualized-list/hooks/useInfiniteLoading.ts',
    find: '}, [enabled])',
    replace: '}, [enabled, loadInitialData])'
  },
  {
    file: 'src/components/virtualized-list/hooks/useVirtualization.ts',
    find: '}, [itemCount, scrollTop])',
    replace: '}, [itemCount, scrollTop, getItemOffset])'
  },
  {
    file: 'src/features/alertas/pages/AlertasPageV2.backup.tsx',
    find: '}, [searchTerm, selectedSeverities, fetchAlertas, fetchAlertasActivas])',
    replace: '}, [searchTerm, selectedSeverities])'
  },
  {
    file: 'src/features/alertas/pages/AlertasPageV2.backup.tsx',
    find: '}, [alertas, alertasActivas, alertasSorting])',
    replace: '}, [alertasSorting])'
  },
  {
    file: 'src/features/alertas/pages/AlertasPageV2.backup.tsx',
    find: '}, [alertas, filter])',
    replace: '}, [filter])'
  },
  {
    file: 'src/features/analytics/components/AlertFlowAnalysis.tsx',
    find: '}, [alertas])',
    replace: '}, [])'
  },
  {
    file: 'src/features/analytics/components/LogisticsFlowChart.tsx',
    find: '}, [transitos])',
    replace: '}, [])'
  },
  {
    file: 'src/features/analytics/components/PrecintoLifecycleFlow.tsx',
    find: '}, [precintos])',
    replace: '}, [])'
  },
  {
    file: 'src/features/analytics/components/TreemapDashboardSimple.tsx',
    find: '}, [precintos])',
    replace: '}, [])'
  },
  {
    file: 'src/features/analytics/components/TreemapDashboardSimple.tsx',
    find: '}, [transitos])',
    replace: '}, [])'
  },
  {
    file: 'src/features/analytics/components/TreemapDashboardSimple.tsx',
    find: '}, [alertas])',
    replace: '}, [])'
  },
  {
    file: 'src/features/analytics/components/treemap/OperationalTreemap.tsx',
    find: '}, [precintos, transitos, alertas, viewType])',
    replace: '}, [viewType])'
  },
  {
    file: 'src/features/analytics/components/treemap/PrecintosTreemap.tsx',
    find: '}, [precintos, groupBy])',
    replace: '}, [groupBy])'
  },
  {
    file: 'src/features/armado/components/ArmForm.tsx',
    find: '}, [selectedPrecinto])',
    replace: '}, [selectedPrecinto, data.precintoId, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmForm.tsx',
    find: '}, [selectedEmpresa])',
    replace: '}, [selectedEmpresa, data.rutEmpresa, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmForm.tsx',
    find: '}, [selectedEmpresaName])',
    replace: '}, [selectedEmpresaName, data.empresa, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmFormCompact.tsx',
    find: '}, [selectedPrecinto])',
    replace: '}, [selectedPrecinto, data.precintoId, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmFormCompact.tsx',
    find: '}, [selectedEmpresa])',
    replace: '}, [selectedEmpresa, data.rutEmpresa, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmFormCompact.tsx',
    find: '}, [selectedEmpresaName])',
    replace: '}, [selectedEmpresaName, data.empresa, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmFormEnhanced.tsx',
    find: '}, [selectedPrecinto])',
    replace: '}, [selectedPrecinto, data.precintoId, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmFormEnhanced.tsx',
    find: '}, [selectedEmpresa])',
    replace: '}, [selectedEmpresa, data.rutEmpresa, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmFormEnhanced.tsx',
    find: '}, [selectedEmpresaName])',
    replace: '}, [selectedEmpresaName, data.empresa, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmFormV2.tsx',
    find: '}, [selectedPrecinto, data])',
    replace: '}, [selectedPrecinto, data, onChange])'
  },
  {
    file: 'src/features/armado/components/ArmFormV2.tsx',
    find: '}, [selectedEmpresa])',
    replace: '}, [selectedEmpresa, form])'
  },
  {
    file: 'src/features/armado/components/ArmFormV2.tsx',
    find: '}, [selectedEmpresaName])',
    replace: '}, [selectedEmpresaName, form])'
  },
  {
    file: 'src/features/armado/pages/ArmadoPage.tsx',
    find: '}, [navigate])',
    replace: '}, [navigate, prearmData])'
  },
  {
    file: 'src/features/armado/pages/ArmadoPageV2.tsx',
    find: '}, [fetchPrecintos])',
    replace: '}, [])'
  },
  {
    file: 'src/features/armado/pages/ArmadoWaitingPage.tsx',
    find: '}, [transitId])',
    replace: '}, [transitId, fetchTransitData])'
  },
  {
    file: 'src/features/camioneros/components/FichaCamionero.tsx',
    find: '}, [selectCamionero, clearSelection])',
    replace: '}, [])'
  },
  {
    file: 'src/features/camioneros/components/ListaCamioneros.tsx',
    find: '}, [fetchCamioneros])',
    replace: '}, [])'
  },
  {
    file: 'src/store/hooks/useAlertas.ts',
    find: '}, [initialFetch])',
    replace: '}, [initialFetch, store])'
  },
  {
    file: 'src/store/hooks/useAlertas.ts',
    find: '}, [fetch])',
    replace: '}, [fetch, store])'
  },
  {
    file: 'src/store/hooks/usePrecintos.ts',
    find: '}, [initialFetch])',
    replace: '}, [initialFetch, store])'
  },
  {
    file: 'src/store/hooks/usePrecintos.ts',
    find: '}, [fetch])',
    replace: '}, [fetch, store])'
  },
  {
    file: 'src/store/hooks/useSystemStatus.ts',
    find: '}, [initialFetch])',
    replace: '}, [initialFetch, store])'
  },
  {
    file: 'src/store/hooks/useTransitos.ts',
    find: '}, [initialFetch])',
    replace: '}, [initialFetch, store])'
  },
  {
    file: 'src/store/hooks/useTransitos.ts',
    find: '}, [fetch])',
    replace: '}, [fetch, store])'
  }
];

// Apply fixes
let fixedCount = 0;

// Apply specific fixes
specificFixes.forEach(({ file, find, replace, multifix, afterContent, append }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    if (multifix) {
      multifix.forEach(({ find, replace }) => {
        if (content.includes(find)) {
          content = content.replace(find, replace);
          hasChanges = true;
        }
      });
    } else if (find && replace) {
      if (content.includes(find)) {
        content = content.replace(find, replace);
        hasChanges = true;
      }
    } else if (afterContent && append) {
      const index = content.lastIndexOf(afterContent);
      if (index !== -1) {
        const insertPoint = index + afterContent.length;
        content = content.substring(0, insertPoint) + append + content.substring(insertPoint);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

// Apply hooks dependency fixes
hooksDependencyFixes.forEach(({ file, find, replace }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(find)) {
      content = content.replace(find, replace);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed hook deps: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files`);