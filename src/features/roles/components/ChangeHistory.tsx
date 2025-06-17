import React, { useState, useMemo } from 'react';
import { X, Clock, User, Shield, Filter, FileText } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { useRolesStore } from '../../../store/rolesStore';
import type { PermissionChange, Role, Section } from '../../../types/roles';
import { SECTION_LABELS, ROLE_LABELS, PERMISSION_LABELS } from '../../../types/roles';

interface ChangeHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeHistory: React.FC<ChangeHistoryProps> = ({ isOpen, onClose }) => {
  const getPermissionHistory = useRolesStore(state => state.getPermissionHistory);
  const [filterRole, setFilterRole] = useState<Role | ''>('');
  const [filterSection, setFilterSection] = useState<Section | ''>('');
  
  const history = useMemo(() => {
    const filters: any = {};
    if (filterRole) filters.role = filterRole;
    if (filterSection) filters.section = filterSection;
    
    return getPermissionHistory(filters);
  }, [getPermissionHistory, filterRole, filterSection]);
  
  if (!isOpen) return null;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getChangeDescription = (change: PermissionChange) => {
    const added = change.newPermissions.filter(p => !change.oldPermissions.includes(p));
    const removed = change.oldPermissions.filter(p => !change.newPermissions.includes(p));
    
    const parts = [];
    if (added.length > 0) {
      parts.push(`Agregó: ${added.map(p => PERMISSION_LABELS[p]).join(', ')}`);
    }
    if (removed.length > 0) {
      parts.push(`Quitó: ${removed.map(p => PERMISSION_LABELS[p]).join(', ')}`);
    }
    
    return parts.join(' | ');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-white">
                  Historial de Cambios
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            {/* Filters */}
            <div className="p-4 bg-gray-900/50 border-b border-gray-700">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Filtrar por:</span>
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as Role | '')}
                  className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Todos los roles</option>
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <option key={role} value={role}>{label}</option>
                  ))}
                </select>
                
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value as Section | '')}
                  className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Todas las secciones</option>
                  {Object.entries(SECTION_LABELS).map(([section, label]) => (
                    <option key={section} value={section}>{label}</option>
                  ))}
                </select>
                
                {(filterRole || filterSection) && (
                  <button
                    onClick={() => {
                      setFilterRole('');
                      setFilterSection('');
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
            
            {/* History List */}
            <div className="overflow-y-auto max-h-[50vh]">
              {history.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No hay cambios registrados</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {history.map((change) => (
                    <div key={change.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-white font-medium">
                              {change.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(change.timestamp)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className={cn(
                              'h-4 w-4',
                              change.role === 'God' && 'text-purple-500',
                              change.role === 'Gerente' && 'text-blue-500',
                              change.role === 'Supervisor' && 'text-green-500',
                              change.role === 'CMO' && 'text-yellow-500'
                            )} />
                            <span className="text-sm text-gray-300">
                              {ROLE_LABELS[change.role]} - {SECTION_LABELS[change.section]}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-400">
                            {getChangeDescription(change)}
                          </p>
                        </div>
                        
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          change.action === 'grant' 
                            ? 'bg-green-900/20 text-green-400' 
                            : 'bg-red-900/20 text-red-400'
                        )}>
                          {change.action === 'grant' ? 'Otorgado' : 'Revocado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/30">
              <p className="text-xs text-gray-400 text-center">
                Mostrando los últimos {history.length} cambios
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};