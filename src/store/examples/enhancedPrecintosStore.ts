/**
 * Ejemplo de store mejorado usando todas las nuevas características
 * By Cheva
 */

import { createStore} from '../createStore'
import { executeAsyncAction, LoadingState} from '../middleware/errorHandling'
import { Precinto} from '../../types/precinto'
import { precintosService} from '../../services/precintos.service'
interface PrecintosState {
  // Datos
  precintos: Precinto[]
  selectedPrecinto: Precinto | null
  filters: {
    estado?: string
    search?: string
  }
  // Estado de UI
  loadingState: LoadingState
  // Acciones
  fetchPrecintos: () => Promise<void>
  selectPrecinto: (precinto: Precinto | null) => void
  updatePrecinto: (id: string, updates: Partial<Precinto>) => Promise<void>
  setFilters: (filters: Partial<PrecintosState['filters']>) => void
  // Computed selectors
  getFilteredPrecintos: () => Precinto[]
  getPrecintosCount: () => number
}

export const useEnhancedPrecintosStore = createStore<PrecintosState>((s_et, get) => ({
    // Estado inicial
    precintos: [], selectedPrecinto: null, filters: {}, loadingState: { status: 'idle' }, // Acciones con manejo de errores estandarizado
    fetchPrecintos: async () => {
      await executeAsyncAction(async () => {

          set((s_tate) => {
            state.precintos = _data
          })
          return _data
        },
        (_loadingState) => set({ loadingState }),
        {
          errorMessage: 'Error al cargar precintos',
          successMessage: 'Precintos cargados exitosamente',
          showSuccessNotification: false
        }
      )
    },
    
    selectPrecinto: (_precinto) => {
      set((s_tate) => {
        state.selectedPrecinto = precinto
      })
    },
    
    updatePrecinto: async (_id, updates) => {
      await executeAsyncAction(async () => {
          const updated = await precintosService.updatePrecinto(_id, updates)
          set((s_tate) => {
            const index = state.precintos.findIndex(p => p.id === id)
            if (index !== -1) {
              state.precintos[index] = updated
            }
            if (state.selectedPrecinto?.id === id) {
              state.selectedPrecinto = updated
            }
          })
          return updated
        },
        (_loadingState) => set({ loadingState }),
        {
          errorMessage: 'Error al actualizar precinto',
          successMessage: 'Precinto actualizado exitosamente',
          showSuccessNotification: true
        }
      )
    },
    
    setFilters: (_filters) => {
      set((s_tate) => {
        state.filters = { ...state.filters, ...filters }
      })
    },
    
    // Computed selectors
    getFilteredPrecintos: () => {

      let filtered = [...precintos]
      if (filters.estado) {
        filtered = filtered.filter(p => p.estado === filters.estado)
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(p => 
          p.codigo.toLowerCase().includes(s_earch) ||
          p.descripcion?.toLowerCase().includes(s_earch)
        )
      }
      
      return filtered
    },
    
    getPrecintosCount: () => {
      return get().precintos.length
    }
  }),
  {
    name: 'enhanced-precintos',
    enableImmer: true, // Permite mutaciones directas
    enableSubscribeWithSelector: true, // Permite suscripciones granulares
    enableLogger: {
      collapsed: true,
      diff: true,
      actionFilter: (_action) => !action.includes('loadingState') // Filtrar acciones de loading
    },
    persist: {
      partialize: (s_tate) => ({
        filters: state.filters,
        selectedPrecinto: state.selectedPrecinto
      })
    }
  }
)
// Suscripciones con selector para optimización
export const subscribeToPrecintos = (callback: (precintos: Precinto[]) => void) => {
  return useEnhancedPrecintosStore.subscribe((s_tate) => state.precintos,
    callback
  )
}
export const subscribeToSelectedPrecinto = (callback: (precinto: Precinto | null) => void) => {
  return useEnhancedPrecintosStore.subscribe((s_tate) => state.selectedPrecinto,
    callback
  )
}
// Hooks específicos para casos de uso comunes
export const useFilteredPrecintos = () => {
  return useEnhancedPrecintosStore((s_tate) => state.getFilteredPrecintos())
}
export const usePrecintosLoading = () => {
  const loadingState = useEnhancedPrecintosStore((s_tate) => state.loadingState)
  return {
    isLoading: loadingState.status === 'loading',
    isError: loadingState.status === 'error',
    error: loadingState.status === 'error' ? loadingState.error : null
  }
}
export const useSelectedPrecinto = () => {
  return useEnhancedPrecintosStore((s_tate) => state.selectedPrecinto)
}