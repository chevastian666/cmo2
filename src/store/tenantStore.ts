/**
 * Tenant Store - Zustand store for multi-tenant state management
 * By Cheva
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Tenant, TenantUser, TenantContext } from '@/features/multiTenant/types';

interface TenantStore {
  // State
  currentTenant: Tenant | null;
  currentUser: TenantUser | null;
  tenants: Tenant[]; // For users with access to multiple tenants
  isLoading: boolean;
  error: string | null;
  
  // Computed
  context: TenantContext | null;
  canSwitchTenants: boolean;
  
  // Actions
  setCurrentTenant: (tenant: Tenant) => void;
  setCurrentUser: (user: TenantUser) => void;
  setTenants: (tenants: Tenant[]) => void;
  switchTenant: (tenantId: string) => Promise<void>;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => void;
  updateTenantCustomization: (customization: Partial<Tenant['customization']>) => void;
  checkFeature: (feature: string) => boolean;
  checkLimit: (resource: string, amount?: number) => boolean;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        currentTenant: null,
        currentUser: null,
        tenants: [],
        isLoading: false,
        error: null,
        
        // Computed getters
        get context() {
          const {_currentTenant, _currentUser} = get();
          if (!currentTenant || !currentUser) return null;
          
          return {
            tenant: currentTenant,
            user: currentUser,
            permissions: currentUser.permissions,
            features: currentTenant.plan.features,
            limits: currentTenant.plan.limits,
            customization: currentTenant.customization
          };
        },
        
        get canSwitchTenants() {
          return get().tenants.length > 1;
        },
        
        // Actions
        setCurrentTenant: (tenant) => set((state) => {
          state.currentTenant = tenant;
          state.error = null;
        }),
        
        setCurrentUser: (user) => set((state) => {
          state.currentUser = user;
        }),
        
        setTenants: (tenants) => set((state) => {
          state.tenants = tenants;
        }),
        
        switchTenant: async (tenantId) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });
          
          try {
            // Find tenant in available tenants
            const tenant = get().tenants.find(t => t.id === tenantId);
            if (!tenant) {
              throw new Error('Tenant not found or access denied');
            }
            
            // Update current tenant
            set((state) => {
              state.currentTenant = tenant;
              state.isLoading = false;
            });
            
            // Persist selection
            localStorage.setItem('lastTenantId', tenantId);
            
            // Reload app data for new tenant context
            window.location.reload();
          } catch (_error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to switch tenant';
              state.isLoading = false;
            });
          }
        },
        
        updateTenantSettings: (settings) => set((state) => {
          if (state.currentTenant) {
            state.currentTenant.settings = {
              ...state.currentTenant.settings,
              ...settings
            };
          }
        }),
        
        updateTenantCustomization: (customization) => set((state) => {
          if (state.currentTenant) {
            state.currentTenant.customization = {
              ...state.currentTenant.customization,
              ...customization
            };
          }
        }),
        
        checkFeature: (feature) => {
          const tenant = get().currentTenant;
          if (!tenant) return false;
          return tenant.plan.features.includes(feature);
        },
        
        checkLimit: (resource, amount = 1) => {
          const tenant = get().currentTenant;
          if (!tenant) return false;
          
          const limits = tenant.plan.limits;
          const usage = tenant.usage.current;
          
          switch (resource) {
            case 'users':
              return (usage.users + amount) <= limits.users;
            case 'precintos':
              return (usage.precintos + amount) <= limits.precintos;
            case 'transitos':
              return (usage.transitos + amount) <= limits.transitosPerMonth;
            case 'alerts':
              return (usage.alerts + amount) <= limits.alertsPerMonth;
            case 'apiCalls':
              return (usage.apiCalls + amount) <= limits.apiCallsPerDay;
            default:
              return true;
          }
        },
        
        clearTenant: () => set((state) => {
          state.currentTenant = null;
          state.currentUser = null;
          state.tenants = [];
          state.error = null;
        })
      })),
      {
        name: 'tenant-store',
        partialize: (state) => ({
          currentTenant: state.currentTenant,
          currentUser: state.currentUser,
          tenants: state.tenants
        })
      }
    ),
    {
      name: 'TenantStore'
    }
  )
);