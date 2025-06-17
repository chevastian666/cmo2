import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RadialMenuSettings } from '../types';

interface RadialMenuStore {
  settings: RadialMenuSettings;
  userPermissions: string[];
  updateSettings: (settings: Partial<RadialMenuSettings>) => void;
  setUserPermissions: (permissions: string[]) => void;
  canUseAction: (requiredPermissions: string[]) => boolean;
  toggleFavorite: (actionId: string) => void;
  reorderActions: (actionIds: string[]) => void;
}

export const useRadialMenuStore = create<RadialMenuStore>()(
  persist(
    (set, get) => ({
      settings: {
        favoriteActions: [],
        customOrder: undefined,
        defaultSize: 'medium',
        animationSpeed: 1,
        hapticFeedback: true
      },
      userPermissions: [],

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setUserPermissions: (permissions) => {
        set({ userPermissions: permissions });
      },

      canUseAction: (requiredPermissions) => {
        if (requiredPermissions.length === 0) return true;
        const { userPermissions } = get();
        return requiredPermissions.some(perm => userPermissions.includes(perm));
      },

      toggleFavorite: (actionId) => {
        set((state) => {
          const favorites = [...state.settings.favoriteActions];
          const index = favorites.indexOf(actionId);
          
          if (index > -1) {
            favorites.splice(index, 1);
          } else {
            favorites.push(actionId);
          }

          return {
            settings: { ...state.settings, favoriteActions: favorites }
          };
        });
      },

      reorderActions: (actionIds) => {
        set((state) => ({
          settings: { ...state.settings, customOrder: actionIds }
        }));
      }
    }),
    {
      name: 'radial-menu-settings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
);