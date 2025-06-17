import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Role, Section, Permission, PermissionChange } from '../types/roles';
import { notificationService } from '../services/shared/notification.service';

interface RolesStore {
  // Permissions matrix
  permissions: Record<Role, Record<Section, Permission[]>>;
  
  // Current user role (this would come from auth in production)
  currentUserRole: Role;
  
  // Permission changes history
  permissionHistory: PermissionChange[];
  
  // Loading states
  loading: boolean;
  saving: boolean;
  
  // Actions
  updatePermissions: (role: Role, section: Section, permissions: Permission[]) => void;
  togglePermission: (role: Role, section: Section, permission: Permission) => void;
  setRolePermissions: (role: Role, permissions: Record<Section, Permission[]>) => void;
  setSectionPermissions: (section: Section, permissions: Record<Role, Permission[]>) => void;
  canAccess: (section: Section, permission?: Permission) => boolean;
  canAccessForRole: (role: Role, section: Section, permission?: Permission) => boolean;
  loadPermissions: () => Promise<void>;
  savePermissions: () => Promise<void>;
  setCurrentUserRole: (role: Role) => void;
  addHistoryEntry: (change: Omit<PermissionChange, 'id' | 'timestamp'>) => void;
  getPermissionHistory: (filters?: { role?: Role; section?: Section }) => PermissionChange[];
}

// Default permissions setup
const defaultPermissions: Record<Role, Record<Section, Permission[]>> = {
  God: {
    dashboard: ['view', 'create', 'edit', 'delete'],
    transitos: ['view', 'create', 'edit', 'delete'],
    precintos: ['view', 'create', 'edit', 'delete'],
    alertas: ['view', 'create', 'edit', 'delete'],
    mapa: ['view', 'create', 'edit', 'delete'],
    prediccion: ['view', 'create', 'edit', 'delete'],
    'torre-control': ['view', 'create', 'edit', 'delete'],
    depositos: ['view', 'create', 'edit', 'delete'],
    'zonas-descanso': ['view', 'create', 'edit', 'delete'],
    roles: ['view', 'create', 'edit', 'delete'],
    configuracion: ['view', 'create', 'edit', 'delete']
  },
  Gerente: {
    dashboard: ['view'],
    transitos: ['view', 'create', 'edit'],
    precintos: ['view', 'create', 'edit'],
    alertas: ['view', 'create', 'edit'],
    mapa: ['view'],
    prediccion: ['view'],
    'torre-control': ['view', 'edit'],
    depositos: ['view', 'edit'],
    'zonas-descanso': ['view'],
    roles: [],
    configuracion: ['view']
  },
  Supervisor: {
    dashboard: ['view'],
    transitos: ['view', 'edit'],
    precintos: ['view', 'edit'],
    alertas: ['view', 'edit'],
    mapa: ['view'],
    prediccion: ['view'],
    'torre-control': ['view'],
    depositos: ['view'],
    'zonas-descanso': ['view'],
    roles: [],
    configuracion: []
  },
  CMO: {
    dashboard: ['view'],
    transitos: ['view'],
    precintos: ['view'],
    alertas: ['view'],
    mapa: ['view'],
    prediccion: ['view'],
    'torre-control': ['view'],
    depositos: ['view'],
    'zonas-descanso': ['view'],
    roles: [],
    configuracion: []
  }
};

export const useRolesStore = create<RolesStore>()(
  devtools(
    persist(
      (set, get) => ({
        permissions: defaultPermissions,
        currentUserRole: 'God', // Default to God for development
        permissionHistory: [],
        loading: false,
        saving: false,

        updatePermissions: (role, section, permissions) => {
          const oldPermissions = get().permissions[role][section];
          
          set((state) => ({
            permissions: {
              ...state.permissions,
              [role]: {
                ...state.permissions[role],
                [section]: permissions
              }
            }
          }));

          // Add history entry
          get().addHistoryEntry({
            userId: 'current-user', // In production, get from auth
            userName: 'Admin User', // In production, get from auth
            role,
            section,
            oldPermissions,
            newPermissions: permissions,
            action: permissions.length > oldPermissions.length ? 'grant' : 'revoke'
          });
        },

        togglePermission: (role, section, permission) => {
          const currentPermissions = get().permissions[role][section];
          const hasPermission = currentPermissions.includes(permission);
          
          let newPermissions: Permission[];
          
          if (hasPermission) {
            // Remove permission
            newPermissions = currentPermissions.filter(p => p !== permission);
            
            // Cascade removal: if removing 'view', remove all permissions
            if (permission === 'view') {
              newPermissions = [];
            }
          } else {
            // Add permission
            newPermissions = [...currentPermissions, permission];
            
            // Cascade addition: if adding non-view permission, ensure view is included
            if (permission !== 'view' && !newPermissions.includes('view')) {
              newPermissions.push('view');
            }
          }
          
          get().updatePermissions(role, section, newPermissions);
        },

        setRolePermissions: (role, permissions) => {
          set((state) => ({
            permissions: {
              ...state.permissions,
              [role]: permissions
            }
          }));
        },

        setSectionPermissions: (section, permissions) => {
          const newPermissions = { ...get().permissions };
          
          Object.keys(permissions).forEach((role) => {
            newPermissions[role as Role][section] = permissions[role as Role];
          });
          
          set({ permissions: newPermissions });
        },

        canAccess: (section, permission = 'view') => {
          const { currentUserRole, permissions } = get();
          return permissions[currentUserRole][section].includes(permission);
        },

        canAccessForRole: (role, section, permission = 'view') => {
          const { permissions } = get();
          return permissions[role][section].includes(permission);
        },

        loadPermissions: async () => {
          set({ loading: true });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In production, fetch from API
            // const response = await api.getPermissions();
            // set({ permissions: response.data });
            
            notificationService.success('Permisos cargados correctamente');
          } catch (error) {
            notificationService.error('Error al cargar permisos');
          } finally {
            set({ loading: false });
          }
        },

        savePermissions: async () => {
          set({ saving: true });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // In production, save to API
            // await api.savePermissions(get().permissions);
            
            notificationService.success('Permisos guardados correctamente');
          } catch (error) {
            notificationService.error('Error al guardar permisos');
          } finally {
            set({ saving: false });
          }
        },

        setCurrentUserRole: (role) => {
          set({ currentUserRole: role });
        },

        addHistoryEntry: (change) => {
          const entry: PermissionChange = {
            ...change,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date()
          };
          
          set((state) => ({
            permissionHistory: [entry, ...state.permissionHistory].slice(0, 100) // Keep last 100 entries
          }));
        },

        getPermissionHistory: (filters) => {
          let history = get().permissionHistory;
          
          if (filters?.role) {
            history = history.filter(h => h.role === filters.role);
          }
          
          if (filters?.section) {
            history = history.filter(h => h.section === filters.section);
          }
          
          return history;
        }
      }),
      {
        name: 'roles-store',
        partialize: (state) => ({
          permissions: state.permissions,
          currentUserRole: state.currentUserRole,
          permissionHistory: state.permissionHistory
        })
      }
    ),
    {
      name: 'RolesStore'
    }
  )
);