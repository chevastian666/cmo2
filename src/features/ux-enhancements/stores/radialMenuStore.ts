import { create} from 'zustand'
import { persist} from 'zustand/middleware'
import type { RadialMenuSettings} from '../types'
interface RadialMenuStore {
  settings: RadialMenuSettings
  userPermissions: string[]
  updateSettings: (settings: Partial<RadialMenuSettings>) => void
  setUserPermissions: (permissions: string[]) => void
  canUseAction: (requiredPermissions: string[]) => boolean
  toggleFavorite: (actionId: string) => void
  reorderActions: (actionIds: string[]) => void
}

export const useRadialMenuStore = create<RadialMenuStore>()(persist(
    (s_et, get) => ({
      settings: {
        favoriteActions: [], customOrder: undefined, defaultSize: 'medium', animationSpeed: 1, hapticFeedback: true
      }, userPermissions: [], updateSettings: (_newSettings) => {
        set((s_tate) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      setUserPermissions: (_permissions) => {
        set({ userPermissions: permissions })
      },

      canUseAction: (_requiredPermissions) => {
        if (requiredPermissions.length === 0) return true
        return requiredPermissions.some(perm => userPermissions.includes(_perm))
      },

      toggleFavorite: (_actionId) => {
        set((s_tate) => {
          const favorites = [...state.settings.favoriteActions]
          const index = favorites.indexOf(_actionId)
          if (index > -1) {
            favorites.splice(_index, 1)
          } else {
            favorites.push(_actionId)
          }

          return {
            settings: { ...state.settings, favoriteActions: favorites }
          }
        })
      },

      reorderActions: (_actionIds) => {
        set((s_tate) => ({
          settings: { ...state.settings, customOrder: actionIds }
        }))
      }
    }),
    {
      name: 'radial-menu-settings',
      partialize: (s_tate) => ({ settings: state.settings })
    }
  )
)