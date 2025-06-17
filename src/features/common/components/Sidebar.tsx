import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity,
  LayoutDashboard,
  Map,
  Truck,
  AlertTriangle,
  History,
  FileText,
  Package,
  Users,
  Building2,
  Palmtree,
  Monitor,
  BookOpen,
  HardHat,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { useAlertasActivas } from '../../../store/hooks';
import { useAccess } from '../../../hooks/useAccess';
import type { Section } from '../../../types/roles';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  group?: string;
  section?: Section;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { count: alertCount } = useAlertasActivas();

  const allNavItems: NavItem[] = [
    // Módulos principales
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="h-5 w-5" />,
      group: 'principal',
      section: 'dashboard'
    },
    {
      id: 'mapa',
      label: 'Mapa',
      path: '/torre-control',
      icon: <Map className="h-5 w-5" />,
      group: 'principal',
      section: 'torre-control'
    },
    {
      id: 'transitos',
      label: 'Tránsitos',
      path: '/transitos',
      icon: <Truck className="h-5 w-5" />,
      group: 'principal',
      section: 'transitos'
    },
    {
      id: 'alertas',
      label: 'Alertas',
      path: '/alertas',
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: alertCount > 0 ? alertCount : undefined,
      group: 'principal',
      section: 'alertas'
    },
    {
      id: 'historico',
      label: 'Histórico',
      path: '/novedades',
      icon: <History className="h-5 w-5" />,
      group: 'principal'
    },
    {
      id: 'documentacion',
      label: 'Documentación',
      path: '/documentacion',
      icon: <FileText className="h-5 w-5" />,
      group: 'principal'
    },

    // Gestión y operaciones
    {
      id: 'armado',
      label: 'Armado',
      path: '/armado',
      icon: <HardHat className="h-5 w-5" />,
      group: 'operaciones'
    },
    {
      id: 'prearmado',
      label: 'Prearmado',
      path: '/prearmado',
      icon: <Package className="h-5 w-5" />,
      group: 'operaciones'
    },
    {
      id: 'precintos',
      label: 'Precintos',
      path: '/precintos',
      icon: <Package className="h-5 w-5" />,
      group: 'operaciones',
      section: 'precintos'
    },

    // Bases de datos
    {
      id: 'despachantes',
      label: 'Despachantes',
      path: '/despachantes',
      icon: <Users className="h-5 w-5" />,
      group: 'datos'
    },
    {
      id: 'depositos',
      label: 'Depósitos',
      path: '/depositos',
      icon: <Building2 className="h-5 w-5" />,
      group: 'datos',
      section: 'depositos'
    },
    {
      id: 'camiones',
      label: 'Camiones',
      path: '/camiones',
      icon: <Truck className="h-5 w-5" />,
      group: 'datos'
    },
    {
      id: 'camioneros',
      label: 'Camioneros',
      path: '/camioneros',
      icon: <Users className="h-5 w-5" />,
      group: 'datos'
    },
    {
      id: 'zonas-descanso',
      label: 'Zonas Descanso',
      path: '/zonas-descanso',
      icon: <Palmtree className="h-5 w-5" />,
      group: 'datos',
      section: 'zonas-descanso'
    },

    // Administración
    {
      id: 'roles',
      label: 'Gestión de Roles',
      path: '/roles',
      icon: <Shield className="h-5 w-5" />,
      group: 'admin',
      section: 'roles'
    },

    // Otros
    {
      id: 'modo-tv',
      label: 'Modo TV',
      path: '/modo-tv',
      icon: <Monitor className="h-5 w-5" />,
      group: 'otros'
    }
  ];
  
  // Filter items based on access permissions
  const navItems = allNavItems.filter(item => {
    if (!item.section) return true; // Always show items without section control
    return useAccess(item.section);
  });

  const groups = {
    principal: 'Módulos Principales',
    operaciones: 'Gestión y Operaciones',
    datos: 'Bases de Datos',
    admin: 'Administrador',
    otros: 'Otros'
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 z-30 transition-all duration-300 flex flex-col shadow-xl",
        isCollapsed ? "w-20" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900/50">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-bold text-white">CMO</h2>
            </div>
          )}
          {isCollapsed && (
            <Activity className="h-6 w-6 text-blue-500 mx-auto" />
          )}
          
          <div className="flex items-center gap-2">
            {/* Mobile close button */}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
            
            {/* Collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title={isCollapsed ? "Expandir" : "Colapsar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {Object.entries(groups).map(([groupKey, groupLabel]) => {
            const groupItems = navItems.filter(item => item.group === groupKey);
            if (groupItems.length === 0) return null;

            return (
              <div key={groupKey} className="mb-6">
                {!isCollapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {groupLabel}
                  </h3>
                )}
                
                <ul className="space-y-1">
                  {groupItems.map(item => (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 transition-all duration-200 relative",
                          isCollapsed ? "justify-center" : "",
                          isActive(item.path)
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <span className={cn(
                          "flex-shrink-0",
                          isActive(item.path) ? "text-white" : "text-gray-400"
                        )}>
                          {item.icon}
                        </span>
                        
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-sm font-medium">
                              {item.label}
                            </span>
                            
                            {item.badge && (
                              <span className={cn(
                                "px-2 py-0.5 text-xs font-bold rounded-full",
                                isActive(item.path)
                                  ? "bg-white text-blue-600"
                                  : "bg-red-600 text-white"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        
                        {isCollapsed && item.badge && (
                          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-gray-800 p-4",
          isCollapsed && "px-2"
        )}>
          {!isCollapsed ? (
            <div className="text-xs text-gray-500">
              <p>Sistema de Monitoreo</p>
              <p className="mt-1">v2.0.0</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-xs text-gray-500">2.0</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};