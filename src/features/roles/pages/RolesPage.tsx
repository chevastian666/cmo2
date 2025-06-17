import React, { useState, useEffect } from 'react';
import { Shield, Save, History, Eye, Users, AlertTriangle } from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { RolesTable } from '../components/RolesTable';
import { RoleCard } from '../components/RoleCard';
import { ChangeHistory } from '../components/ChangeHistory';
import { RolesTableSkeleton, RoleCardSkeleton } from '../components/RolesTableSkeleton';
import { useRolesStore } from '../../../store/rolesStore';
import { notificationService } from '../../../services/shared/notification.service';
import type { Role } from '../../../types/roles';
import { ROLE_LABELS } from '../../../types/roles';
import { cn } from '../../../utils/utils';

const ROLES: Role[] = ['God', 'Gerente', 'Supervisor', 'CMO'];

export const RolesPage: React.FC = () => {
  const { 
    loading, 
    saving, 
    currentUserRole,
    loadPermissions, 
    savePermissions,
    setCurrentUserRole
  } = useRolesStore();
  
  const [showHistory, setShowHistory] = useState(false);
  const [expandedRole, setExpandedRole] = useState<Role | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewRole, setPreviewRole] = useState<Role>('CMO');
  const [hasChanges, setHasChanges] = useState(false);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  // Load permissions on mount
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);
  
  // Track changes
  useEffect(() => {
    const unsubscribe = useRolesStore.subscribe(
      (state) => state.permissions,
      () => setHasChanges(true)
    );
    
    return unsubscribe;
  }, []);
  
  const handleSave = async () => {
    try {
      await savePermissions();
      setHasChanges(false);
    } catch (error) {
      // Error is handled in the store
    }
  };
  
  const handlePreviewToggle = () => {
    if (!previewMode) {
      setPreviewMode(true);
      setCurrentUserRole(previewRole);
    } else {
      setPreviewMode(false);
      setCurrentUserRole('God'); // Reset to admin
    }
  };
  
  const handlePreviewRoleChange = (role: Role) => {
    setPreviewRole(role);
    if (previewMode) {
      setCurrentUserRole(role);
    }
  };

  // Check if current user has access
  if (currentUserRole !== 'God' && !previewMode) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700 max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-gray-400">
            Solo los administradores pueden acceder a la gestión de roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            Gestión de Roles
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Administra los permisos de acceso para cada rol del sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Historial</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={cn(
              "p-2 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-2",
              hasChanges && !saving
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            )}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
                <span className="hidden sm:inline">Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Guardar cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Preview Mode */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-blue-500" />
            <span className="text-white font-medium">Modo Vista Previa</span>
            <span className="text-sm text-gray-400">
              Simula cómo se ve el panel desde otro rol
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={previewRole}
              onChange={(e) => handlePreviewRoleChange(e.target.value as Role)}
              disabled={!previewMode}
              className={cn(
                "px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none",
                !previewMode && "opacity-50 cursor-not-allowed"
              )}
            >
              {ROLES.map(role => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
            
            <button
              onClick={handlePreviewToggle}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                previewMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              )}
            >
              {previewMode ? 'Salir del preview' : 'Activar preview'}
            </button>
          </div>
        </div>
        
        {previewMode && (
          <div className="mt-3 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-400">
                  Viendo como: {ROLE_LABELS[currentUserRole]}
                </p>
                <p className="text-xs text-blue-300 mt-1">
                  Navega por el sistema para ver cómo se comporta con este rol.
                  Los cambios no se guardarán mientras estés en modo preview.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Permissions Table/Cards */}
      {loading ? (
        isMobile || isTablet ? (
          <div className="space-y-4">
            {ROLES.map(role => (
              <RoleCardSkeleton key={role} />
            ))}
          </div>
        ) : (
          <RolesTableSkeleton />
        )
      ) : (
        <>
          {isMobile || isTablet ? (
            // Mobile/Tablet view - Role cards
            <div className="space-y-4">
              {ROLES.map(role => (
                <RoleCard
                  key={role}
                  role={role}
                  expanded={expandedRole === role}
                  onToggleExpand={() => setExpandedRole(
                    expandedRole === role ? null : role
                  )}
                />
              ))}
            </div>
          ) : (
            // Desktop view - Table
            <RolesTable />
          )}
        </>
      )}
      
      {/* Info Box */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="space-y-2 text-sm text-gray-400">
            <p>
              <strong className="text-gray-300">Importante:</strong> Los cambios en los permisos
              se aplicarán inmediatamente después de guardar. Los usuarios afectados deberán
              actualizar la página para ver los cambios.
            </p>
            <p>
              Los permisos siguen una jerarquía: para poder crear, editar o eliminar,
              primero se debe tener el permiso de ver.
            </p>
          </div>
        </div>
      </div>
      
      {/* Change History Modal */}
      <ChangeHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
};