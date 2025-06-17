import React, { useState } from 'react';
import { Activity, Bell, Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/utils';
import { APP_CONFIG } from '../../../config';
import { ConnectionStatus } from './ConnectionStatus';
import { RealtimeNotifications } from './RealtimeNotifications';
import { AlarmSummary } from './AlarmSummary';
import { useAlertasActivas } from '../../../store/hooks';
import { useAuth, useUserInfo } from '../../../hooks/useAuth';
import { useConnectionStatus } from '../../../hooks/useSharedState';
import { PanelSwitcher } from '../../../components/PanelSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  console.log('Layout: Rendering with children:', children);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const connectionStatus = useConnectionStatus();
  const { count: alertCount } = useAlertasActivas();
  const { logout } = useAuth();
  const userInfo = useUserInfo();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center ml-4 md:ml-0">
                <Activity className="h-8 w-8 text-blue-500" />
                <h1 className="ml-2 text-xl sm:text-2xl font-semibold">{APP_CONFIG.APP_NAME}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              <div className="hidden sm:block">
                <ConnectionStatus status={connectionStatus} />
              </div>
              
              {/* Alarm Summary - Hidden on mobile to save space */}
              <div className="hidden md:block">
                <AlarmSummary />
              </div>
              
              {/* Panel Switcher - Hidden on small screens */}
              <div className="hidden lg:block">
                <PanelSwitcher currentPanel="cmo" />
              </div>
              
              {/* Notifications */}
              <button className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 relative">
                <Bell size={18} className="sm:w-5 sm:h-5" />
                {alertCount > 0 && (
                  <>
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-sm text-white font-bold">{alertCount}</span>
                    </span>
                  </>
                )}
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-base font-medium text-white">{userInfo.name}</p>
                    <p className="text-sm text-gray-400">{userInfo.role}</p>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-400 transition-transform",
                    userMenuOpen && "rotate-180"
                  )} />
                </button>
                
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-20">
                      <div className="py-1">
                        <a
                          href="#/profile"
                          className="flex items-center px-4 py-2 text-base text-gray-300 hover:bg-gray-700"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Perfil
                        </a>
                        <a
                          href="#/settings"
                          className="flex items-center px-4 py-2 text-base text-gray-300 hover:bg-gray-700"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configuración
                        </a>
                        <div className="border-t border-gray-700 my-1" />
                        <button
                          onClick={() => logout()}
                          className="w-full flex items-center px-4 py-2 text-base text-gray-300 hover:bg-gray-700 text-left"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="mt-16 md:mt-8 px-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/armado" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/armado" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Armado
                </Link>
              </li>
              <li>
                <Link 
                  to="/transitos" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/transitos" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Tránsitos
                </Link>
              </li>
              <li>
                <Link 
                  to="/precintos" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/precintos" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Precintos
                </Link>
              </li>
              <li>
                <Link 
                  to="/alertas" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/alertas" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Alertas
                </Link>
              </li>
              <li>
                <Link 
                  to="/despachantes" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/despachantes" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Despachantes
                </Link>
              </li>
              <li>
                <Link 
                  to="/depositos" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/depositos" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Depósitos
                </Link>
              </li>
              <li>
                <Link 
                  to="/zonas-descanso" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/zonas-descanso" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Zonas Descanso
                </Link>
              </li>
              <li>
                <Link 
                  to="/torre-control" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/torre-control" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Torre Control
                </Link>
              </li>
              <li>
                <Link 
                  to="/documentacion" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/documentacion" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Documentación
                </Link>
              </li>
              <li>
                <Link 
                  to="/novedades" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/novedades" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Novedades
                </Link>
              </li>
              <li>
                <Link 
                  to="/camiones" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/camiones" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Camiones
                </Link>
              </li>
              <li>
                <Link 
                  to="/camioneros" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/camioneros" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Camioneros
                </Link>
              </li>
              <li>
                <Link 
                  to="/modo-tv" 
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium rounded-md",
                    location.pathname === "/modo-tv" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  Modo TV
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
      
      {/* Real-time notifications */}
      <RealtimeNotifications position="top-right" />
    </div>
  );
};