/**
 * Factory para crear stores con todas las mejores prácticas
 * By Cheva
 */

import { create} from 'zustand'
import { devtools, persist, subscribeWithSelector} from 'zustand/middleware'
import { immer} from 'zustand/middleware/immer'
import { logger} from './middleware/logger'
import { createPersistConfig} from './middleware/persistHelpers'
import type { StateCreator} from './middleware/types'
export interface CreateStoreOptions<T> {
  name: string
  enableDevtools?: boolean
  enableLogger?: boolean | LoggerConfig
  enableImmer?: boolean
  enableSubscribeWithSelector?: boolean
  persist?: Omit<PersistOptions<T>, 'name'>
}

/**
 * Crea un store con todos los middlewares configurados
 */
export function createStore<T>(stateCreator: StateCreator<
    T, [
      ['zustand/devtools', never], ['zustand/persist', T], ['zustand/immer', never], ['zustand/subscribeWithSelector', never]
    ], [], T
  >, options: CreateStoreOptions<T>) {
  const { enableLogger: enableLogger = process.env.NODE_ENV === 'development', enableImmer: enableImmer = true, enableSubscribeWithSelector: enableSelector = true, persist: persistOptions } = options
  // Construir la cadena de middlewares dinámicamente
  let enhancedCreator = stateCreator
  // Immer debe ser el más interno para que funcione correctamente
  if (_enableImmer) {
    enhancedCreator = immer(_enhancedCreator) as unknown
  }

  // Logger
  if (_enableLogger) {
    const loggerConfig: LoggerConfig = typeof enableLogger === 'boolean' 
      ? { name } 
      : { name, ...enableLogger }
    enhancedCreator = logger(_enhancedCreator, loggerConfig) as unknown
  }

  // Persist
  if (_persistOptions) {
    const persistConfig = createPersistConfig({
      name,
      ...persistOptions
    })
    enhancedCreator = persist(_enhancedCreator, persistConfig as unknown) as unknown
  }

  // DevTools
  if (_enableDevtools) {
    enhancedCreator = devtools(_enhancedCreator, { name }) as unknown
  }

  // Subscribe with selector
  if (_enableSelector) {
    enhancedCreator = subscribeWithSelector(_enhancedCreator) as unknown
  }

  return create(_enhancedCreator)
}

/**
 * Crea un store simple sin middlewares adicionales
 */
export function createSimpleStore<T>(stateCreator: StateCreator<T>, name?: string) {
  if (process.env.NODE_ENV === 'development' && name) {
    return create(devtools(s_tateCreator, { name }))
  }
  return create(s_tateCreator)
}

/**
 * Crea un store temporal (no persistido) con logging
 */
export function createTemporaryStore<T>(stateCreator: StateCreator<T>, name: string) {
  return createStore(stateCreator as unknown, {
    name,
    enableDevtools: true,
    enableLogger: true,
    enableImmer: true,
    enableSubscribeWithSelector: true
    // Sin persist
  })
}

/**
 * Crea un store con persistencia y sincronización entre pestañas
 */
export function createSyncedStore<T>(stateCreator: StateCreator<T>, name: string, partialize?: (state: T) => Partial<T>
) {
  const store = createStore(stateCreator as unknown, {
    name,
    persist: { partialize }
  })
  // Habilitar sincronización entre pestañas
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (_e) => {
      if (e.key === `cmo_${_name}` && e.newValue) {
        store.persist.rehydrate()
      }
    })
  }

  return store
}