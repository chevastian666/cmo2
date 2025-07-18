import { useMemo } from 'react'
import { useRolesStore} from '../store/rolesStore'
import type { Section} from '../types/roles'
interface AccessPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  hasAccess: boolean
}

// Simple variant - returns boolean for view permission
export function useAccess(section: Section): boolean
// Advanced variant - returns object with all permissions
export function useAccess(section: Section, advanced: true): AccessPermissions
// Implementation
export function useAccess(section: Section, advanced?: true): boolean | AccessPermissions {
  const canAccess = useRolesStore(state => state.canAccess)
  const permissions = useMemo(() => {
    if (!advanced) {
      return canAccess(section, 'view')
    }
    
    return {
      canView: canAccess(section, 'view'),
      canCreate: canAccess(section, 'create'),
      canEdit: canAccess(section, 'edit'),
      canDelete: canAccess(section, 'delete'),
      hasAccess: canAccess(section, 'view')
    }
  }, [section, advanced, canAccess])
  return permissions
}

// Hook to check access for a specific role (useful for preview mode)
export function useAccessForRole(role: string, section: Section): AccessPermissions {
  const canAccessForRole = useRolesStore(state => state.canAccessForRole)
  return useMemo(() => ({
    canView: canAccessForRole(role as unknown, section, 'view'),
    canCreate: canAccessForRole(role as unknown, section, 'create'),
    canEdit: canAccessForRole(role as unknown, section, 'edit'),
    canDelete: canAccessForRole(role as unknown, section, 'delete'),
    hasAccess: canAccessForRole(role as unknown, section, 'view')
  }), [role, section, canAccessForRole])
}