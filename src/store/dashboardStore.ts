/**
 * Store para el estado del dashboard interactivo
 * By Cheva
 */

import { createStore} from './createStore';
import type { Layouts} from 'react-grid-layout';

interface DashboardState {
  // Layouts guardados
  layouts: Layouts | null;
  
  // Versión del layout (incrementar para forzar reset)
  layoutVersion: number;
  
  // Modo edición
  editMode: boolean;
  
  // Widgets visibles
  visibleWidgets: string[];
  
  // Acciones
  setLayouts: (layouts: Layouts) => void;
  setEditMode: (editMode: boolean) => void;
  toggleWidget: (widgetId: string) => void;
  resetLayouts: () => void;
  
  // Configuración de widgets
  widgetSettings: Record<string, unknown>;
  updateWidgetSettings: (widgetId: string, settings: unknown) => void;
}

export const useDashboardStore = createStore<DashboardState>((set) => ({
    // Estado inicial
    layouts: null, layoutVersion: 2, // Incrementado para forzar reset
    editMode: false, visibleWidgets: [], widgetSettings: {}, // Acciones
    setLayouts: (layouts) => {
      set((state) => {
        state.layouts = layouts;
      });
    },
    
    setEditMode: (editMode) => {
      set((state) => {
        state.editMode = editMode;
      });
    },
    
    toggleWidget: (widgetId) => {
      set((state) => {
        const index = state.visibleWidgets.indexOf(widgetId);
        if (index === -1) {
          state.visibleWidgets.push(widgetId);
        } else {
          state.visibleWidgets.splice(index, 1);
        }
      });
    },
    
    resetLayouts: () => {
      set((state) => {
        state.layouts = null;
        state.layoutVersion = 2; // Actualizar a la versión actual
        // También resetear configuraciones
        state.widgetSettings = {};
      });
    },
    
    updateWidgetSettings: (widgetId, settings) => {
      set((state) => {
        state.widgetSettings[widgetId] = {
          ...state.widgetSettings[widgetId],
          ...settings
        };
      });
    }
  }),
  {
    name: 'dashboard-layout',
    enableImmer: true,
    persist: {
      partialize: (state) => ({
        layouts: state.layouts,
        visibleWidgets: state.visibleWidgets,
        widgetSettings: state.widgetSettings
      })
    }
  }
);