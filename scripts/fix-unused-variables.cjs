#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing unused variable errors...');

const fixes = [
  // Components
  {
    file: 'src/components/map/MapRenderer.tsx',
    find: 'const { precintos, _center, onPrecintoClick } =',
    replace: 'const { precintos, onPrecintoClick } ='
  },
  {
    file: 'src/components/map/MapView.tsx',
    find: "import React, { memo } from 'react';",
    replace: "import React from 'react';"
  },
  {
    file: 'src/components/notifications/NotificationCenter.tsx',
    find: 'const NotificationCenter: React.FC<NotificationCenterProps> = ({ onToggle }) => {',
    replace: 'const NotificationCenter: React.FC<NotificationCenterProps> = () => {'
  },
  {
    file: 'src/components/priority/PriorityProvider.tsx',
    find: 'const updatePriority = (id: string, priority: number, _config?: PriorityConfig)',
    replace: 'const updatePriority = (id: string, priority: number)'
  },
  {
    file: 'src/components/priority/withPriority.tsx',
    find: "import { PriorityProvider, usePriority, usePriorityScheduler } from",
    replace: "import { PriorityProvider, usePriority } from"
  },
  {
    file: 'src/components/priority/withPriority.tsx',
    find: 'export function withPriority<P extends object>(Component: React.ComponentType<P>, options?: PriorityOptions)',
    replace: 'export function withPriority<P extends object>(Component: React.ComponentType<P>)'
  },
  {
    file: 'src/components/ui/data-table/DataTableV2.tsx',
    find: "import { useState, useMemo } from 'react';",
    replace: "import { useState } from 'react';"
  },
  {
    file: 'src/components/ui/date-picker-range.tsx',
    find: 'const { className, value, onChange, placeholder } =',
    replace: 'const { className, value, placeholder } ='
  },
  {
    file: 'src/components/ui/examples/CompositionExample.tsx',
    find: 'const [isLoading, setIsLoading] = useState(false);',
    replace: '// const [isLoading, setIsLoading] = useState(false);'
  },
  {
    file: 'src/components/ui/form.tsx',
    find: 'const [_id, name] =',
    replace: 'const [, name] ='
  },
  {
    file: 'src/components/ui/map/MapHeader.tsx',
    find: 'activeLayers = [];',
    replace: '// activeLayers = [];'
  },
  {
    file: 'src/components/ui/map/RouteLine.tsx',
    find: 'const RouteLinePopup: React.FC<{ name: string; description?: string; distance?: string; }> = (props)',
    replace: 'const RouteLinePopup: React.FC<{ name: string; description?: string; distance?: string; }> = ({ name, description, distance })'
  },
  {
    file: 'src/components/virtualized-list/utils/memoryManager.ts',
    find: 'subscribe(type: string, callback: () => void)',
    replace: 'subscribe(callback: () => void)'
  },
  
  // Features
  {
    file: 'src/features/alertas/components/AlertaDetalleModal.tsx',
    find: "const usuarioActual = localStorage.getItem('usuario') || 'Sistema';",
    replace: "// const usuarioActual = localStorage.getItem('usuario') || 'Sistema';"
  },
  {
    file: 'src/features/alertas/components/AlertaDetalleModalV2.tsx',
    find: "const usuarioActual = localStorage.getItem('usuario') || 'Sistema';",
    replace: "// const usuarioActual = localStorage.getItem('usuario') || 'Sistema';"
  },
  {
    file: 'src/features/alertas/components/AlertsTable.tsx',
    find: 'const handleAttendAlert = async (alertaId: string) => {',
    replace: 'const handleAttendAlert = async () => {'
  },
  {
    file: 'src/features/alertas/pages/AlertasPage.tsx',
    find: 'const handleClearAllFilters = (_: React.MouseEvent) => {',
    replace: 'const handleClearAllFilters = () => {'
  },
  
  // Services
  {
    file: 'src/services/notifications/groupingService.ts',
    find: 'cleanupStaleGroups(notification: Notification)',
    replace: 'cleanupStaleGroups()'
  },
  {
    file: 'src/services/notifications/notificationService.ts',
    find: 'payload: unknown',
    replace: '_payload: unknown'
  },
  {
    file: 'src/services/notifications/pushNotificationService.ts',
    find: 'removeSubscription(notification: Notification)',
    replace: 'removeSubscription()'
  },
  {
    file: 'src/services/notifications/soundService.ts',
    find: 'catch (error) {',
    replace: 'catch (_error) {'
  },
  {
    file: 'src/services/notifications/soundService.ts',
    find: 'setVolume(volume: number)',
    replace: 'setVolume(_volume: number)'
  },
  {
    file: 'src/services/shared/auth.service.ts',
    find: "import { hasRole } from",
    replace: "// import { hasRole } from"
  },
  {
    file: 'src/services/shared/notification.service.ts',
    find: 'interface NotificationOptions {',
    replace: '// interface NotificationOptions {'
  },
  {
    file: 'src/services/shared/sharedApi.service.ts',
    find: 'on(eventType: string, callback: Function)',
    replace: 'on(_eventType: string, _callback: Function)'
  },
  {
    file: 'src/services/shared/sharedState.service.ts',
    find: 'updatePrecinto(data: unknown)',
    replace: 'updatePrecinto(_data: unknown)'
  },
  {
    file: 'src/services/shared/sharedState.service.ts',
    find: 'updateTransito(data: unknown)',
    replace: 'updateTransito(_data: unknown)'
  },
  {
    file: 'src/services/shared/sharedState.service.ts',
    find: 'updateAlerta(data: unknown)',
    replace: 'updateAlerta(_data: unknown)'
  },
  {
    file: 'src/services/transitos.service.ts',
    find: 'async getTransitosPendientes(filters?: unknown)',
    replace: 'async getTransitosPendientes()'
  },
  
  // Store
  {
    file: 'src/store/middleware/errorHandling.ts',
    find: 'const { errorMessage = \'Ha ocurrido un error\', successMessage, showNotification = true } = options = {};',
    replace: '// Options removed - unused'
  },
  {
    file: 'src/store/middleware/logger.ts',
    find: 'const mergedOptions = { ...defaultOptions, ...options };',
    replace: 'const mergedOptions = { ...defaultOptions };'
  },
  {
    file: 'src/store/middleware/persistHelpers.ts',
    find: 'export const createPersistConfig = <T,>(name: string, options?: Partial<PersistOptions<T>>)',
    replace: 'export const createPersistConfig = <T,>(name: string)'
  },
  {
    file: 'src/store/slices/precintosSlice.ts',
    find: 'export const createPrecintosSlice: StateCreator<PrecintosState> = (set, get) => (',
    replace: 'export const createPrecintosSlice: StateCreator<PrecintosState> = (set) => ('
  },
  {
    file: 'src/store/slices/systemStatusSlice.ts',
    find: 'export const createSystemStatusSlice: StateCreator<SystemStatusState> = (set, get) => (',
    replace: 'export const createSystemStatusSlice: StateCreator<SystemStatusState> = (set) => ('
  },
  {
    file: 'src/store/slices/transitosSlice.ts',
    find: 'export const createTransitosSlice: StateCreator<TransitosState> = (set, get) => (',
    replace: 'export const createTransitosSlice: StateCreator<TransitosState> = (set) => ('
  },
  {
    file: 'src/test/utils/test-utils.tsx',
    find: 'const { id, data } = params;',
    replace: 'const { id } = params;'
  }
];

// Process fixes
let fixedCount = 0;
fixes.forEach(({ file, find, replace }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(find)) {
      content = content.replace(find, replace);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files with unused variables`);