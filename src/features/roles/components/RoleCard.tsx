import React from 'react';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { PermissionCheckbox } from './PermissionCheckbox';
import { useRolesStore } from '../../../store/rolesStore';
import type { Role, Section, Permission } from '../../../types/roles';
import { SECTION_LABELS, ROLE_LABELS, PERMISSION_LABELS } from '../../../types/roles';

interface RoleCardProps {
  role: Role;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

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

const PERMISSIONS: Permission[] = ['view', 'create', 'edit', 'delete'];

export const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  expanded = false, 
  onToggleExpand 
}) => {
  const { permissions, togglePermission } = useRolesStore();
  
  const hasPermission = (section: Section, permission: Permission) => {
    return permissions[role][section].includes(permission);
  };
  
  const isPermissionDisabled = (section: Section, permission: Permission) => {
    if (permission === 'view') return false;
    return !hasPermission(section, 'view');
  };
  
  const getRoleColor = () => {
    switch (role) {
      case 'God':
        return 'border-purple-600 bg-purple-900/20';
      case 'Gerente':
        return 'border-blue-600 bg-blue-900/20';
      case 'Supervisor':
        return 'border-green-600 bg-green-900/20';
      case 'CMO':
        return 'border-yellow-600 bg-yellow-900/20';
      default:
        return 'border-gray-600 bg-gray-900/20';
    }
  };
  
  const getRoleIcon = () => {
    switch (role) {
      case 'God':
        return 'text-purple-500';
      case 'Gerente':
        return 'text-blue-500';
      case 'Supervisor':
        return 'text-green-500';
      case 'CMO':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={cn(
      'rounded-lg border-2 overflow-hidden transition-all duration-200',
      getRoleColor()
    )}>
      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Shield className={cn('h-5 w-5', getRoleIcon())} />
          <span className="text-lg font-semibold text-white">
            {ROLE_LABELS[role]}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      
      {expanded && (
        <div className="p-4 space-y-3 bg-gray-900/50">
          {SECTIONS.map(section => (
            <div key={section} className="bg-gray-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-2">
                {SECTION_LABELS[section]}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSIONS.map(permission => (
                  <PermissionCheckbox
                    key={permission}
                    checked={hasPermission(section, permission)}
                    onChange={() => togglePermission(role, section, permission)}
                    permission={permission}
                    disabled={isPermissionDisabled(section, permission)}
                    showLabel
                    size="sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};