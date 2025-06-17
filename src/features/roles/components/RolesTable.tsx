import React, { useMemo, useCallback } from 'react';
import { Shield, Info } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { PermissionCheckbox, BulkPermissionCheckbox } from './PermissionCheckbox';
import { useRolesStore } from '../../../store/rolesStore';
import type { Role, Section, Permission } from '../../../types/roles';
import { SECTION_LABELS, ROLE_LABELS, PERMISSION_LABELS } from '../../../types/roles';

const SECTIONS: Section[] = [
  'dashboard',
  'transitos',
  'precintos',
  'alertas',
  'mapa',
  'prediccion',
  'torre-control',
  'depositos',
  'zonas-descanso',
  'roles',
  'configuracion'
];

const ROLES: Role[] = ['God', 'Gerente', 'Supervisor', 'CMO'];
const PERMISSIONS: Permission[] = ['view', 'create', 'edit', 'delete'];

export const RolesTable: React.FC = () => {
  const { permissions, togglePermission, setSectionPermissions, setRolePermissions } = useRolesStore();
  
  // Calculate bulk checkbox states for sections
  const sectionBulkStates = useMemo(() => {
    const states: Record<Section, { checked: boolean; indeterminate: boolean }> = {} as any;
    
    SECTIONS.forEach(section => {
      let totalPermissions = 0;
      let checkedPermissions = 0;
      
      ROLES.forEach(role => {
        PERMISSIONS.forEach(permission => {
          totalPermissions++;
          if (permissions[role][section].includes(permission)) {
            checkedPermissions++;
          }
        });
      });
      
      states[section] = {
        checked: checkedPermissions === totalPermissions,
        indeterminate: checkedPermissions > 0 && checkedPermissions < totalPermissions
      };
    });
    
    return states;
  }, [permissions]);
  
  // Calculate bulk checkbox states for roles
  const roleBulkStates = useMemo(() => {
    const states: Record<Role, { checked: boolean; indeterminate: boolean }> = {} as any;
    
    ROLES.forEach(role => {
      let totalPermissions = 0;
      let checkedPermissions = 0;
      
      SECTIONS.forEach(section => {
        PERMISSIONS.forEach(permission => {
          totalPermissions++;
          if (permissions[role][section].includes(permission)) {
            checkedPermissions++;
          }
        });
      });
      
      states[role] = {
        checked: checkedPermissions === totalPermissions,
        indeterminate: checkedPermissions > 0 && checkedPermissions < totalPermissions
      };
    });
    
    return states;
  }, [permissions]);
  
  const handleSectionBulkToggle = useCallback((section: Section, checked: boolean) => {
    const newPermissions: Record<Role, Permission[]> = {} as any;
    
    ROLES.forEach(role => {
      newPermissions[role] = checked ? [...PERMISSIONS] : [];
    });
    
    setSectionPermissions(section, newPermissions);
  }, [setSectionPermissions]);
  
  const handleRoleBulkToggle = useCallback((role: Role, checked: boolean) => {
    const newPermissions: Record<Section, Permission[]> = {} as any;
    
    SECTIONS.forEach(section => {
      newPermissions[section] = checked ? [...PERMISSIONS] : [];
    });
    
    setRolePermissions(role, newPermissions);
  }, [setRolePermissions]);
  
  const hasPermission = (role: Role, section: Section, permission: Permission) => {
    return permissions[role][section].includes(permission);
  };
  
  // Check if permission should be disabled based on cascading rules
  const isPermissionDisabled = (role: Role, section: Section, permission: Permission) => {
    // If it's 'view', it's never disabled
    if (permission === 'view') return false;
    
    // Other permissions are disabled if 'view' is not granted
    return !hasPermission(role, section, 'view');
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-900/50 px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Sección / Rol
                  </span>
                </div>
              </th>
              {ROLES.map(role => (
                <th key={role} className="px-6 py-4 text-center min-w-[200px]">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-white">
                      {ROLE_LABELS[role]}
                    </div>
                    <BulkPermissionCheckbox
                      checked={roleBulkStates[role].checked}
                      indeterminate={roleBulkStates[role].indeterminate}
                      onChange={(checked) => handleRoleBulkToggle(role, checked)}
                      label="Todos"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {SECTIONS.map(section => (
              <tr key={section} className="hover:bg-gray-700/50 transition-colors">
                <td className="sticky left-0 z-10 bg-gray-800 px-6 py-4 border-r border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {SECTION_LABELS[section]}
                    </span>
                    <BulkPermissionCheckbox
                      checked={sectionBulkStates[section].checked}
                      indeterminate={sectionBulkStates[section].indeterminate}
                      onChange={(checked) => handleSectionBulkToggle(section, checked)}
                    />
                  </div>
                </td>
                {ROLES.map(role => (
                  <td key={`${section}-${role}`} className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      {PERMISSIONS.map(permission => (
                        <div key={permission} className="relative group">
                          <PermissionCheckbox
                            checked={hasPermission(role, section, permission)}
                            onChange={() => togglePermission(role, section, permission)}
                            permission={permission}
                            disabled={isPermissionDisabled(role, section, permission)}
                            size="sm"
                          />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {PERMISSION_LABELS[permission]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="p-4 bg-gray-900/30 border-t border-gray-700">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="space-y-1 text-xs text-gray-400">
            <p className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-600 rounded"></span>
                Ver
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-600 rounded"></span>
                Crear
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-yellow-600 rounded"></span>
                Editar
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-600 rounded"></span>
                Eliminar
              </span>
            </p>
            <p>
              <strong>Nota:</strong> Los permisos de crear, editar y eliminar requieren el permiso de ver.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};