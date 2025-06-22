#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing services and store errors batch 4...');

const fixes = [
  // Fix services
  {
    file: 'src/services/notifications/groupingService.ts',
    find: 'cleanupStaleGroups(notification: Notification): void {',
    replace: 'cleanupStaleGroups(): void {'
  },
  {
    file: 'src/services/notifications/notificationService.ts',
    find: 'payload: unknown',
    replace: '_payload: unknown'
  },
  {
    file: 'src/services/notifications/pushNotificationService.ts',
    find: 'async removeSubscription(notification: Notification): Promise<void> {',
    replace: 'async removeSubscription(): Promise<void> {'
  },
  {
    file: 'src/services/notifications/soundService.ts',
    content: (() => {
      let content = fs.readFileSync(path.join(process.cwd(), 'src/services/notifications/soundService.ts'), 'utf8');
      content = content.replace(/} catch \(error\) {/g, '} catch (_error) {');
      content = content.replace(/setVolume\(volume: number\): void {/g, 'setVolume(_volume: number): void {');
      content = content.replace(/:\s*any/g, ': unknown');
      return content;
    })()
  },
  {
    file: 'src/services/shared/auth.service.ts',
    find: "import { User, LoginCredentials, AuthResponse, hasRole } from '@/types/auth';",
    replace: "import { User, LoginCredentials, AuthResponse } from '@/types/auth';"
  },
  {
    file: 'src/services/shared/sharedApi.service.ts',
    content: (() => {
      let content = fs.readFileSync(path.join(process.cwd(), 'src/services/shared/sharedApi.service.ts'), 'utf8');
      content = content.replace(/on\(eventType: string, callback: Function\): void {/g, 'on(_eventType: string, _callback: Function): void {');
      content = content.replace(/\(error as any\)\.code/g, '(error as Error & { code?: string }).code');
      return content;
    })()
  },
  {
    file: 'src/services/shared/sharedState.service.ts',
    content: (() => {
      let content = fs.readFileSync(path.join(process.cwd(), 'src/services/shared/sharedState.service.ts'), 'utf8');
      content = content.replace(/updatePrecinto\(data: unknown\): void {/g, 'updatePrecinto(_data: unknown): void {');
      content = content.replace(/updateTransito\(data: unknown\): void {/g, 'updateTransito(_data: unknown): void {');
      content = content.replace(/updateAlerta\(data: unknown\): void {/g, 'updateAlerta(_data: unknown): void {');
      return content;
    })()
  },
  {
    file: 'src/services/transitos.service.ts',
    find: 'async getTransitosPendientes(filters?: unknown): Promise<Transitov2[]> {',
    replace: 'async getTransitosPendientes(): Promise<Transitov2[]> {'
  },
  
  // Fix store files
  {
    file: 'src/store/middleware/errorHandling.ts',
    content: (() => {
      let content = fs.readFileSync(path.join(process.cwd(), 'src/store/middleware/errorHandling.ts'), 'utf8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('const { errorMessage =') && lines[i].includes('options = {}')) {
          lines[i] = '  // Options parameter removed - unused';
          break;
        }
      }
      
      return lines.join('\n');
    })()
  },
  {
    file: 'src/store/middleware/logger.ts',
    find: 'const mergedOptions = { ...defaultOptions, ...options };',
    replace: 'const mergedOptions = { ...defaultOptions };'
  },
  {
    file: 'src/store/middleware/persistHelpers.ts',
    find: 'export const createPersistConfig = <T,>(name: string, options?: Partial<PersistOptions<T>>): PersistOptions<T> => {',
    replace: 'export const createPersistConfig = <T,>(name: string): PersistOptions<T> => {'
  },
  {
    file: 'src/store/slices/alertasSlice.ts',
    content: (() => {
      let content = fs.readFileSync(path.join(process.cwd(), 'src/store/slices/alertasSlice.ts'), 'utf8');
      content = content.replace(/\(error: any\)/g, '(error: unknown)');
      content = content.replace(/error\.message/g, '(error as Error).message');
      return content;
    })()
  },
  {
    file: 'src/store/slices/precintosSlice.ts',
    find: 'export const createPrecintosSlice: StateCreator<PrecintosState> = (set, get) => ({',
    replace: 'export const createPrecintosSlice: StateCreator<PrecintosState> = (set) => ({'
  },
  {
    file: 'src/store/slices/systemStatusSlice.ts',
    find: 'export const createSystemStatusSlice: StateCreator<SystemStatusState> = (set, get) => ({',
    replace: 'export const createSystemStatusSlice: StateCreator<SystemStatusState> = (set) => ({'
  },
  {
    file: 'src/store/slices/transitosSlice.ts',
    find: 'export const createTransitosSlice: StateCreator<TransitosState> = (set, get) => ({',
    replace: 'export const createTransitosSlice: StateCreator<TransitosState> = (set) => ({'
  },
  {
    file: 'src/test/utils/test-utils.tsx',
    content: (() => {
      let content = fs.readFileSync(path.join(process.cwd(), 'src/test/utils/test-utils.tsx'), 'utf8');
      content = content.replace('const { id, data } = params;', 'const { id } = params;');
      content = content.replace(/acc: Record<string, any>/g, 'acc: Record<string, unknown>');
      return content;
    })()
  },
  {
    file: 'src/types/notifications.ts',
    content: (() => {
      let content = fs.readFileSync(path.join(process.cwd(), 'src/types/notifications.ts'), 'utf8');
      content = content.replace(/:\s*Record<string,\s*any>/g, ': Record<string, unknown>');
      return content;
    })()
  },
  {
    file: 'src/utils/performance.ts',
    content: (() => {
      let content = fs.readFileSync(path.join(process.cwd(), 'src/utils/performance.ts'), 'utf8');
      content = content.replace(/:\s*any/g, ': unknown');
      content = content.replace(/\(\.\.\.args:\s*any\[\]\)/g, '(...args: unknown[])');
      content = content.replace(/<T extends \(\.\.\.args: unknown\[\]\) => unknown>/g, '<T extends (...args: unknown[]) => unknown>');
      return content;
    })()
  }
];

// Apply fixes
let fixedCount = 0;

fixes.forEach(({ file, find, replace, content }) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      return;
    }
    
    if (content) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    } else if (find && replace) {
      let fileContent = fs.readFileSync(filePath, 'utf8');
      if (fileContent.includes(find)) {
        fileContent = fileContent.replace(find, replace);
        fs.writeFileSync(filePath, fileContent);
        console.log(`✅ Fixed: ${file}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files`);