/**
 * Helpers para configuración común de persist middleware
 * By Cheva
 */

import { persist} from 'zustand/middleware'
import type { StateCreator, StateStorage} from './types'
export interface PersistOptions<T> {
  name: string
  partialize?: (state: T) => Partial<T>
  version?: number
  migrate?: (persistedState: unknown, version: number) => T
  storage?: StateStorage
  skipHydration?: boolean
}

/**
 * Crea una configuración de persist con valores por defecto
 */
export function createPersistConfig<T>(options: PersistOptions<T>) {

  const {
    name,
    storage = localStorage,
    version = 0,
    partialize,
    migrate,
    skipHydration = false
  } = options
  
  return {
    name,
    storage,
    version,
    partialize,
    migrate,
    skipHydration
  }
}

/**
 * Helper para crear un store con persist y configuración estándar
 */
export function createPersistedStore<T>(
  name: string,
  createState: StateCreator<T>,
  partialize?: (state: T) => Partial<T>
) {
  return persist(createState, createPersistConfig({
    name,
    partialize
  }) as any)
}

/**
 * Helper para sincronización entre pestañas
 */
export function enableCrossTabSync<T>(
  storeName: string,
  _getState: () => T,
  setState: (state: Partial<T>) => void
) {
  if (typeof window === 'undefined') return
  window.addEventListener('storage', (e) => {
    if (e.key === `cmo_${storeName}` && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue)
        // Verificar que el estado es válido antes de actualizar
        if (newState && typeof newState === 'object') {
          setState(newState)
        }
      } catch (error) {
        console.error(`Error sincronizando ${storeName} entre pestañas:`, error)
      }
    }
  })
}

/**
 * Helper para limpiar storage de un store
 */
export function clearPersistedStore(storeName: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`cmo_${storeName}`)
  }
}

/**
 * Helper para exportar todos los estados persistidos
 */
export function exportAllPersistedStates(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  const states: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('cmo_')) {
      const storeName = key.replace('cmo_', '')
      try {
        const value = localStorage.getItem(key)
        if (value) {
          states[storeName] = JSON.parse(value)
        }
      } catch (error) {
        console.error(`Error exportando ${key}:`, error)
      }
    }
  }
  
  return states
}

/**
 * Helper para importar estados persistidos
 */
export function importPersistedStates(states: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  Object.entries(states).forEach(([storeName, state]) => {
    try {
      localStorage.setItem(`cmo_${storeName}`, JSON.stringify(state))
    } catch (error) {
      console.error(`Error importando ${storeName}:`, error)
    }
  })
}