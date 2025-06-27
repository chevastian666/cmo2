/**
 * Logger middleware para Zustand
 * Proporciona logging detallado de acciones y cambios de estado
 * By Cheva
 */

import type { StateCreator, StoreMutatorIdentifier} from './types'
export interface LoggerConfig {
  name?: string
  enabled?: boolean
  collapsed?: boolean
  diff?: boolean
  timestamp?: boolean
  duration?: boolean
  actionFilter?: (action: string) => boolean
  stateFilter?: (state: unknown) => unknown
  colors?: {
    title?: string
    prevState?: string
    action?: string
    nextState?: string
    error?: string
  }
}

const defaultColors = {
  title: '#8B5CF6',
  prevState: '#9CA3AF',
  action: '#3B82F6',
  nextState: '#10B981',
  error: '#EF4444'
}
type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(f: StateCreator<T, Mps, Mcs>, options?: LoggerConfig) => StateCreator<T, Mps, Mcs>
type LoggerImpl = <T>(f: StateCreator<T, [], []>, options?: LoggerConfig) => StateCreator<T, [], []>
const loggerImpl: LoggerImpl = (f, options = {}) => (set, get, store) => {

  const { name = store.name || 'Store', enabled = true, collapsed = false, diff = false, timestamp = true, duration = false, actionFilter = () => true, stateFilter = (state) => state, colors = {} } = options
  const mergedColors = { ...defaultColors, ...colors }
  let startTime: number
  const loggedSet: typeof set = (...args) => {
    const [nextStateOrUpdater] = args
    const action = (nextStateOrUpdater as { type?: string })?.type || 'anonymous'
    if (!enabled || !actionFilter(action)) {
      return set(...args)
    }

    startTime = performance.now()
    const prevState = get()
    // Función para loggear
    const log = () => {
      const nextState = get()
      const endTime = performance.now()
      const took = endTime - startTime
      const groupMethod = collapsed ? console.groupCollapsed : console.group
      // Título del grupo
      const title = `${name} | ${action}${timestamp ? ` @ ${new Date().toLocaleTimeString()}` : ''}${duration ? ` (${took.toFixed(2)}ms)` : ''}`
      groupMethod(`%c${title}`, `color: ${mergedColors.title}; font-weight: bold;`)
      // Estado previo
      console.log('%cprev state', `color: ${mergedColors.prevState}; font-weight: bold;`, stateFilter(prevState))
      // Acción
      console.log('%caction    ', `color: ${mergedColors.action}; font-weight: bold;`, action, nextStateOrUpdater)
      // Estado siguiente
      console.log('%cnext state', `color: ${mergedColors.nextState}; font-weight: bold;`, stateFilter(nextState))
      // Diff opcional
      if (diff) {
        console.log('%cdiff      ', 'color: #E0E0E0; font-weight: bold;', getDiff(prevState, nextState))
      }
      
      console.groupEnd()
    }
    try {
      set(args[0], args[1])
      log()
    } catch (error) {
      console.group(`%c${name} | ERROR`, `color: ${mergedColors.error}; font-weight: bold;`)
      console.error('Error in action:', action)
      console.error(error)
      console.groupEnd()
      throw error
    }
  }
  store.setState = loggedSet
  return f(loggedSet, get, store)
}
// Función helper para calcular diff
function getDiff(prev: unknown, next: unknown): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {}
  const prevObj = prev as Record<string, unknown>
  const nextObj = next as Record<string, unknown>
  // Revisar propiedades eliminadas o modificadas
  for (const key in prevObj) {
    if (!(key in nextObj)) {
      diff[key] = { from: prevObj[key], to: undefined }
    } else if (prevObj[key] !== nextObj[key]) {
      diff[key] = { from: prevObj[key], to: nextObj[key] }
    }
  }
  
  // Revisar propiedades añadidas
  for (const key in nextObj) {
    if (!(key in prevObj)) {
      diff[key] = { from: undefined, to: nextObj[key] }
    }
  }
  
  return diff
}

export const logger = loggerImpl as Logger