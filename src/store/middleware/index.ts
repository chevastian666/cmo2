/**
 * Middlewares personalizados para Zustand
 * Exporta todos los middlewares y helpers
 * By Cheva
 */

export { logger, type LoggerConfig } from './logger'
export { 
  executeAsyncAction, 
  createErrorHandlingSlice,
  useLoadingState,
  type LoadingState,
  type ErrorHandlingState,
  type AsyncActionOptions 
} from './errorHandling'
export {
  createPersistConfig,
  createPersistedStore,
  enableCrossTabSync,
  clearPersistedStore,
  exportAllPersistedStates,
  importPersistedStates,
  type PersistOptions
} from './persistHelpers'
// Re-exportar middlewares de zustand para conveniencia
export { devtools } from 'zustand/middleware'
export { persist, createJSONStorage } from 'zustand/middleware'
export { subscribeWithSelector } from 'zustand/middleware'
export { immer } from 'zustand/middleware/immer'
// Re-exportar tipos desde archivo central
export type { StateCreator, StoreMutatorIdentifier, StateStorage } from './types'