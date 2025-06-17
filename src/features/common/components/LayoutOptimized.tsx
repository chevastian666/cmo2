/**
 * Layout Principal Optimizado del Sistema CMO
 * By Cheva
 */

import React, { useState } from 'react';
import { Activity, Bell, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/utils';
import { APP_CONFIG } from '../../../config';
import { ConnectionStatus } from './ConnectionStatus';
import { RealtimeNotifications } from './RealtimeNotifications';
import { AlarmSummary } from './AlarmSummary';
import { Sidebar } from './Sidebar';
import { useAlertasActivas } from '../../../store/hooks';
import { useAuth, useUserInfo } from '../../../hooks/useAuth';
import { useConnectionStatus } from '../../../hooks/useSharedState';
import { PanelSwitcher } from '../../../components/PanelSwitcher';
import { MicrointeractionsSettings } from '../../microinteractions';

interface LayoutProps {
  children: React.ReactNode;
}

export const LayoutOptimized: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const connectionStatus = useConnectionStatus();
  const { count: alertCount } = useAlertasActivas();
  const { logout } = useAuth();
  const userInfo = useUserInfo();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content area */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                {/* App title */}
                <div className="flex items-center ml-4 lg:ml-0">
                  <Activity className="h-7 w-7 text-blue-500" />
                  <h1 className="ml-2 text-xl font-semibold">{APP_CONFIG.APP_NAME}</h1>
                </div>
              </div>
              
              {/* Right side */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Connection status */}
                <div className="hidden sm:block">
                  <ConnectionStatus status={connectionStatus} />
                </div>
                
                {/* Alarm summary */}
                <div className="hidden md:block">
                  <AlarmSummary />
                </div>
                
                {/* Panel switcher */}
                <div className="hidden lg:block">
                  <PanelSwitcher currentPanel="cmo" />
                </div>
                
                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  <Bell className="h-5 w-5" />
                  {alertCount > 0 && (
                    <>
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{alertCount}</span>
                      </span>
                    </>
                  )}
                </button>
                
                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={userInfo.avatar}
                      alt={userInfo.name}
                      className="h-8 w-8 rounded-full ring-2 ring-gray-700"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-white">{userInfo.name}</p>
                      <p className="text-xs text-gray-400">{userInfo.role}</p>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-gray-400 transition-transform hidden sm:block",
                      userMenuOpen && "rotate-180"
                    )} />
                  </button>
                  
                  {/* User dropdown */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-20">
                        <div className="p-3 border-b border-gray-700">
                          <p className="text-sm font-medium text-white">{userInfo.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{userInfo.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/perfil"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Mi Perfil
                          </Link>
                          <Link
                            to="/configuracion"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Configuración
                          </Link>
                          <hr className="my-2 border-gray-700" />
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
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

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Real-time notifications */}
      <RealtimeNotifications position="bottom-right" />
      
      {/* Microinteractions Settings */}
      <MicrointeractionsSettings />
    </div>
  );
};