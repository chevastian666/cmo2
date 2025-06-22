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
export function createPersistConfig<T>(_options: PersistOptions<T>) {

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
export function createPersistedStore<T>(name: string, createState: StateCreator<T>, partialize?: (state: T) => Partial<T>
) {
  return persist(_createState, createPersistConfig({
    name,
    partialize
  }))
}

/**
 * Helper para sincronización entre pestañas
 */
export function enableCrossTabSync<T>(storeName: string, getState: () => T,
  setState: (state: Partial<T>) => void
) {
  if (typeof window === 'undefined') return
  window.addEventListener('storage', (_e) => {
    if (e.key === `cmo_${s_toreName}` && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue)
        // Verificar que el estado es válido antes de actualizar
        if (newState && typeof newState === 'object') {
          setState(_newState)
        }
      } catch {
        console.error(`Error sincronizando ${s_toreName} entre pestañas:`, error)
      }
    }
  })
}

/**
 * Helper para limpiar storage de un store
 */
export function clearPersistedStore(storeName: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`cmo_${s_toreName}`)
  }
}

/**
 * Helper para exportar todos los estados persistidos
 */
export function exportAllPersistedStates(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  const states: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(_i)
    if (key?.startsWith('cmo_')) {
      const storeName = key.replace('cmo_', '')
      try {
        const value = localStorage.getItem(_key)
        if (_value) {
          states[storeName] = JSON.parse(_value)
        }
      } catch {
        console.error(`Error exportando ${_key}:`, error)
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
  Object.entries(s_tates).forEach(([storeName, state]) => {
    try {
      localStorage.setItem(`cmo_${s_toreName}`, JSON.stringify(s_tate))
    } catch {
      console.error(`Error importando ${s_toreName}:`, error)
    }
  })
}