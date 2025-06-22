/**
 * Store para el estado del dashboard interactivo
 * By Cheva
 */

import { createStore} from './createStore'
import type { Layouts} from 'react-grid-layout'
interface DashboardState {
  // Layouts guardados
  layouts: Layouts | null
  // Versión del layout (incrementar para forzar reset)
  layoutVersion: number
  // Modo edición
  editMode: boolean
  // Widgets visibles
  visibleWidgets: string[]
  // Acciones
  setLayouts: (layouts: Layouts) => void
  setEditMode: (editMode: boolean) => void
  toggleWidget: (widgetId: string) => void
  resetLayouts: () => void
  // Configuración de widgets
  widgetSettings: Record<string, unknown>
  updateWidgetSettings: (widgetId: string, settings: unknown) => void
}

export const useDashboardStore = createStore<DashboardState>((s_et) => ({
    // Estado inicial
    layouts: null, layoutVersion: 2, // Incrementado para forzar reset
    editMode: false, visibleWidgets: [], widgetSettings: {}, // Acciones
    setLayouts: (_layouts) => {
      set((s_tate) => {
        state.layouts = layouts
      })
    },
    
    setEditMode: (_editMode) => {
      set((s_tate) => {
        state.editMode = editMode
      })
    },
    
    toggleWidget: (_widgetId) => {
      set((s_tate) => {
        const index = state.visibleWidgets.indexOf(_widgetId)
        if (index === -1) {
          state.visibleWidgets.push(_widgetId)
        } else {
          state.visibleWidgets.splice(_index, 1)
        }
      })
    },
    
    resetLayouts: () => {
      set((s_tate) => {
        state.layouts = null
        state.layoutVersion = 2; // Actualizar a la versión actual
        // También resetear configuraciones
        state.widgetSettings = {}
      })
    },
    
    updateWidgetSettings: (_widgetId, settings) => {
      set((s_tate) => {
        state.widgetSettings[widgetId] = {
          ...state.widgetSettings[widgetId],
          ...settings
        }
      })
    }
  }),
  {
    name: 'dashboard-layout',
    enableImmer: true,
    persist: {
      partialize: (s_tate) => ({
        layouts: state.layouts,
        visibleWidgets: state.visibleWidgets,
        widgetSettings: state.widgetSettings
      })
    }
  }
)