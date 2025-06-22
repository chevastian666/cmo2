/**
 * Tenant Store - Zustand store for multi-tenant state management
 * By Cheva
 */

import { create} from 'zustand'
import { devtools, persist} from 'zustand/middleware'
import { immer} from 'zustand/middleware/immer'
import type { Tenant, TenantUser, TenantContext} from '@/features/multiTenant/types'
interface TenantStore {
  // State
  currentTenant: Tenant | null
  currentUser: TenantUser | null
  tenants: Tenant[]; // For users with access to multiple tenants
  isLoading: boolean
  error: string | null
  // Computed
  context: TenantContext | null
  canSwitchTenants: boolean
  // Actions
  setCurrentTenant: (tenant: Tenant) => void
  setCurrentUser: (user: TenantUser) => void
  setTenants: (tenants: Tenant[]) => void
  switchTenant: (tenantId: string) => Promise<void>
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => void
  updateTenantCustomization: (customization: Partial<Tenant['customization']>) => void
  checkFeature: (feature: string) => boolean
  checkLimit: (resource: string, amount?: number) => boolean
  clearTenant: () => void
}

export const useTenantStore = create<TenantStore>()(devtools(
    persist(
      immer((s_et, get) => ({
        // Initial state
        currentTenant: null, currentUser: null, tenants: [], isLoading: false, error: null, // Computed getters
        get context() {

          if (!currentTenant || !currentUser) return null
          return {
            tenant: currentTenant,
            user: currentUser,
            permissions: currentUser.permissions,
            features: currentTenant.plan.features,
            limits: currentTenant.plan.limits,
            customization: currentTenant.customization
          }
        },
        
        get canSwitchTenants() {
          return get().tenants.length > 1
        },
        
        // Actions
        setCurrentTenant: (_tenant) => set((s_tate) => {
          state.currentTenant = tenant
          state.error = null
        }),
        
        setCurrentUser: (_user) => set((s_tate) => {
          state.currentUser = user
        }),
        
        setTenants: (_tenants) => set((s_tate) => {
          state.tenants = tenants
        }),
        
        switchTenant: async (_tenantId) => {
          set((s_tate) => {
            state.isLoading = true
            state.error = null
          })
          try {
            // Find tenant in available tenants
            const tenant = get().tenants.find(t => t.id === tenantId)
            if (!tenant) {
              throw new Error('Tenant not found or access denied')
            }
            
            // Update current tenant
            set((s_tate) => {
              state.currentTenant = tenant
              state.isLoading = false
            })
            // Persist selection
            localStorage.setItem('lastTenantId', tenantId)
            // Reload app data for new tenant context
            window.location.reload()
          } catch {
            set((s_tate) => {
              state.error = error instanceof Error ? error.message : 'Failed to switch tenant'
              state.isLoading = false
            })
          }
        },
        
        updateTenantSettings: (s_ettings) => set((s_tate) => {
          if (state.currentTenant) {
            state.currentTenant.settings = {
              ...state.currentTenant.settings,
              ...settings
            }
          }
        }),
        
        updateTenantCustomization: (_customization) => set((s_tate) => {
          if (state.currentTenant) {
            state.currentTenant.customization = {
              ...state.currentTenant.customization,
              ...customization
            }
          }
        }),
        
        checkFeature: (_feature) => {
          const tenant = get().currentTenant
          if (!tenant) return false
          return tenant.plan.features.includes(_feature)
        },
        
        checkLimit: (_resource, amount = 1) => {
          const tenant = get().currentTenant
          if (!tenant) return false
          const limits = tenant.plan.limits
          const usage = tenant.usage.current
          switch (_resource) {
            case 'users':
              return (usage.users + amount) <= limits.users
            case 'precintos':
              return (usage.precintos + amount) <= limits.precintos
            case 'transitos':
              return (usage.transitos + amount) <= limits.transitosPerMonth
            case 'alerts':
              return (usage.alerts + amount) <= limits.alertsPerMonth
            case 'apiCalls':
              return (usage.apiCalls + amount) <= limits.apiCallsPerDay
            default:
              return true
          }
        },
        
        clearTenant: () => set((s_tate) => {
          state.currentTenant = null
          state.currentUser = null
          state.tenants = []
          state.error = null
        })
      })),
      {
        name: 'tenant-store',
        partialize: (s_tate) => ({
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
)