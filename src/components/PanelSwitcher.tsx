import React, { useState } from 'react';
import { Monitor, Truck, ChevronDown, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/utils';

interface PanelSwitcherProps {
  currentPanel: 'cmo' | 'encargados';
}

export const PanelSwitcher: React.FC<PanelSwitcherProps> = ({ currentPanel }) => {
  const { canAccessCMO, canAccessEncargados } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const panels = [
    {
      id: 'cmo',
      name: 'Centro de Monitoreo',
      icon: Monitor,
      url: import.meta.env.VITE_CMO_URL || '/',
      canAccess: canAccessCMO()
    },
    {
      id: 'encargados',
      name: 'Panel Encargados',
      icon: Truck,
      url: import.meta.env.VITE_ENCARGADOS_URL || 'https://encargados.blocktracker.uy',
      canAccess: canAccessEncargados()
    }
  ];

  const availablePanels = panels.filter(p => p.canAccess);
  const currentPanelInfo = panels.find(p => p.id === currentPanel);

  if (availablePanels.length <= 1) {
    return null; // Don't show switcher if user only has access to one panel
  }

  const handlePanelSwitch = (panel: typeof panels[0]) => {
    if (panel.id !== currentPanel) {
      window.location.href = panel.url;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        {currentPanelInfo && (
          <>
            <currentPanelInfo.icon className="h-4 w-4 text-gray-400" />
            <span className="text-base text-gray-300">{currentPanelInfo.name}</span>
          </>
        )}
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-20">
            <div className="p-2">
              <p className="text-sm text-gray-500 px-2 py-1">Cambiar Panel</p>
              {availablePanels.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => handlePanelSwitch(panel)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors",
                    panel.id === currentPanel
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700 text-gray-300"
                  )}
                >
                  <panel.icon className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="text-base font-medium">{panel.name}</p>
                    {panel.id === 'cmo' && (
                      <p className="text-sm text-gray-500">Monitoreo en tiempo real</p>
                    )}
                    {panel.id === 'encargados' && (
                      <p className="text-sm text-gray-500">Gestión de tránsitos</p>
                    )}
                  </div>
                  {panel.id !== currentPanel && (
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};