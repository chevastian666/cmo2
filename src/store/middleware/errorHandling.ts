/**
 * Sistema estandarizado de manejo de errores para Zustand
 * By Cheva
 */

import { notificationService} from '../../services/notificationService'
export type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success' }
export interface ErrorHandlingState {
  loadingState: LoadingState
  setLoadingState: (state: LoadingState) => void
}

export interface AsyncActionOptions {
  showErrorNotification?: boolean
  errorMessage?: string
  successMessage?: string
  showSuccessNotification?: boolean
}

/**
 * Helper para ejecutar acciones asíncronas con manejo de errores consistente
 */
export async function executeAsyncAction<T>(action: () => Promise<T>,
  setLoadingState: (state: LoadingState) => void,
  options: AsyncActionOptions = {}
): Promise<T | null> {

  setLoadingState({ status: 'loading' })
  try {
    const result = await action()
    setLoadingState({ status: 'success' })
    if (options.showSuccessNotification && options.successMessage) {
      notificationService.success(options.successMessage)
    }
    
    return result
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : options.errorMessage || 'Error desconocido'
    setLoadingState({ status: 'error', error: errorMsg })
    if (options.showErrorNotification !== false) {
      notificationService.error(errorMsg)
    }
    
    console.error('Error en acción asíncrona:', error)
    return null
  }
}

/**
 * Crea el estado y acciones base para manejo de errores
 */
export function createErrorHandlingSlice(): ErrorHandlingState {
  return {
    loadingState: { status: 'idle' },
    setLoadingState: (state) => ({ loadingState: state })
  }
}

/**
 * Hook helper para usar el estado de loading
 */
export function useLoadingState(loadingState: LoadingState) {
  return {
    isIdle: loadingState.status === 'idle',
    isLoading: loadingState.status === 'loading',
    isError: loadingState.status === 'error',
    isSuccess: loadingState.status === 'success',
    error: loadingState.status === 'error' ? loadingState.error : null
  }
}