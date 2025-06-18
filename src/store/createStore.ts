/**
 * Factory para crear stores con todas las mejores prácticas
 * By Cheva
 */

import { create, StateCreator } from 'zustand';
import { devtools, persist, subscribeWithSelector, immer } from 'zustand/middleware';
import { logger, LoggerConfig } from './middleware/logger';
import { createPersistConfig, PersistOptions } from './middleware/persistHelpers';

export interface CreateStoreOptions<T> {
  name: string;
  enableDevtools?: boolean;
  enableLogger?: boolean | LoggerConfig;
  enableImmer?: boolean;
  enableSubscribeWithSelector?: boolean;
  persist?: Omit<PersistOptions<T>, 'name'>;
}

/**
 * Crea un store con todos los middlewares configurados
 */
export function createStore<T>(
  stateCreator: StateCreator<
    T,
    [
      ['zustand/devtools', never],
      ['zustand/persist', T],
      ['zustand/immer', never],
      ['zustand/subscribeWithSelector', never]
    ],
    [],
    T
  >,
  options: CreateStoreOptions<T>
) {
  const {
    name,
    enableDevtools = process.env.NODE_ENV === 'development',
    enableLogger: enableLoggerOption = process.env.NODE_ENV === 'development',
    enableImmer: enableImmerOption = true,
    enableSubscribeWithSelector: enableSelector = true,
    persist: persistOptions
  } = options;

  // Construir la cadena de middlewares dinámicamente
  let enhancedCreator = stateCreator;

  // Immer debe ser el más interno para que funcione correctamente
  if (enableImmerOption) {
    enhancedCreator = immer(enhancedCreator) as any;
  }

  // Logger
  if (enableLoggerOption) {
    const loggerConfig: LoggerConfig = typeof enableLoggerOption === 'boolean' 
      ? { name } 
      : { name, ...enableLoggerOption };
    
    enhancedCreator = logger(enhancedCreator, loggerConfig) as any;
  }

  // Persist
  if (persistOptions) {
    const persistConfig = createPersistConfig({
      name,
      ...persistOptions
    });
    enhancedCreator = persist(enhancedCreator, persistConfig as any) as any;
  }

  // DevTools
  if (enableDevtools) {
    enhancedCreator = devtools(enhancedCreator, { name }) as any;
  }

  // Subscribe with selector
  if (enableSelector) {
    enhancedCreator = subscribeWithSelector(enhancedCreator) as any;
  }

  return create(enhancedCreator);
}

/**
 * Crea un store simple sin middlewares adicionales
 */
export function createSimpleStore<T>(
  stateCreator: StateCreator<T>,
  name?: string
) {
  if (process.env.NODE_ENV === 'development' && name) {
    return create(devtools(stateCreator, { name }));
  }
  return create(stateCreator);
}

/**
 * Crea un store temporal (no persistido) con logging
 */
export function createTemporaryStore<T>(
  stateCreator: StateCreator<T>,
  name: string
) {
  return createStore(stateCreator as any, {
    name,
    enableDevtools: true,
    enableLogger: true,
    enableImmer: true,
    enableSubscribeWithSelector: true
    // Sin persist
  });
}

/**
 * Crea un store con persistencia y sincronización entre pestañas
 */
export function createSyncedStore<T>(
  stateCreator: StateCreator<T>,
  name: string,
  partialize?: (state: T) => Partial<T>
) {
  const store = createStore(stateCreator as any, {
    name,
    persist: { partialize }
  });

  // Habilitar sincronización entre pestañas
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === `cmo_${name}` && e.newValue) {
        store.persist.rehydrate();
      }
    });
  }

  return store;
}