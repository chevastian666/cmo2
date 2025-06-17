import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAccess } from '../hooks/useAccess';
import type { Section, Permission } from '../types/roles';

interface ProtectedRouteProps {
  section: Section;
  permission?: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  section,
  permission = 'view',
  children,
  fallback,
  redirectTo = '/'
}) => {
  const canAccess = useRolesStore(state => state.canAccess);
  const hasAccess = canAccess(section, permission);
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (redirectTo === 'none') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700 max-w-md">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
            <p className="text-gray-400 mb-6">
              No tienes permisos para acceder a esta sección. 
              Contacta a tu administrador si crees que esto es un error.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
    
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

// HOC variant for more flexibility
export function withProtection<P extends object>(
  Component: React.ComponentType<P>,
  section: Section,
  permission: Permission = 'view'
) {
  return (props: P) => (
    <ProtectedRoute section={section} permission={permission}>
      <Component {...props} />
    </ProtectedRoute>
  );
}

// Import the store
import { useRolesStore } from '../store/rolesStore';