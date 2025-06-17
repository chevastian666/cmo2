import React, { useState } from 'react';
import { RadialMenu } from '../components/RadialMenu/RadialMenu';
import { SmartClipboard } from '../components/SmartClipboard/SmartClipboard';
import { useClipboard } from '../hooks/useClipboard';
import { useRadialMenuStore } from '../stores/radialMenuStore';
import {
  LockClosedIcon,
  BellIcon,
  DocumentTextIcon,
  MapPinIcon,
  ChartBarIcon,
  CameraIcon,
  TruckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export const UXEnhancementsDemo: React.FC = () => {
  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedPrecinto, setSelectedPrecinto] = useState<string | null>(null);
  
  const { copyToClipboard } = useClipboard();
  const { setUserPermissions } = useRadialMenuStore();

  // Simular datos de precintos
  const precintos = [
    { 
      id: 'PE12345678', 
      status: 'ACTIVO', 
      location: { lat: -34.603722, lng: -58.381592 },
      alerts: 2 
    },
    { 
      id: 'PE87654321', 
      status: 'VIOLADO', 
      location: { lat: -34.615743, lng: -58.433298 },
      alerts: 5 
    },
    { 
      id: 'PE11223344', 
      status: 'EN_TRANSITO', 
      location: { lat: -34.598456, lng: -58.420134 },
      alerts: 0 
    }
  ];

  // Definir acciones del menú radial
  const radialActions = [
    {
      id: 'lock',
      label: 'Bloquear Precinto',
      icon: LockClosedIcon,
      action: (context: any) => {
        console.log('Bloqueando precinto:', context.precintoId);
        copyToClipboard(`BLOQUEO: Precinto ${context.precintoId} bloqueado`, {
          source: 'radial-menu',
          precintoId: context.precintoId
        });
      },
      color: 'bg-red-600 hover:bg-red-500',
      shortcut: 'cmd+l',
      permissions: ['precinto.lock'],
      badge: selectedPrecinto === 'PE87654321' ? '!' : undefined
    },
    {
      id: 'alert',
      label: 'Crear Alerta',
      icon: BellIcon,
      action: (context: any) => {
        const alertId = Math.floor(Math.random() * 10000);
        console.log('Creando alerta para:', context.precintoId);
        copyToClipboard(`ALERTA #${alertId}: Precinto ${context.precintoId} - SEVERIDAD: ALTA`, {
          source: 'radial-menu',
          precintoId: context.precintoId,
          alertId: alertId.toString()
        });
      },
      color: 'bg-yellow-600 hover:bg-yellow-500',
      shortcut: 'cmd+a',
      permissions: ['alert.create']
    },
    {
      id: 'report',
      label: 'Generar Reporte',
      icon: DocumentTextIcon,
      action: (context: any) => {
        const reportNum = Math.floor(Math.random() * 1000);
        console.log('Generando reporte:', context.precintoId);
        copyToClipboard(
          `REPORTE #${reportNum}\nFECHA: ${new Date().toLocaleDateString()}\nPRECINTO: ${context.precintoId}\nOPERADOR: Demo User`,
          { source: 'radial-menu', precintoId: context.precintoId }
        );
      },
      color: 'bg-green-600 hover:bg-green-500',
      shortcut: 'cmd+r',
      permissions: ['report.create']
    },
    {
      id: 'location',
      label: 'Ver Ubicación',
      icon: MapPinIcon,
      action: (context: any) => {
        const precinto = precintos.find(p => p.id === context.precintoId);
        if (precinto) {
          copyToClipboard(
            `UBICACION: ${context.precintoId}\nLATITUDE: ${precinto.location.lat}\nLONGITUDE: ${precinto.location.lng}`,
            { source: 'radial-menu', precintoId: context.precintoId }
          );
        }
      },
      color: 'bg-blue-600 hover:bg-blue-500',
      shortcut: 'cmd+m',
      permissions: ['precinto.view']
    },
    {
      id: 'stats',
      label: 'Ver Estadísticas',
      icon: ChartBarIcon,
      action: (context: any) => {
        console.log('Mostrando estadísticas:', context.precintoId);
      },
      color: 'bg-purple-600 hover:bg-purple-500',
      shortcut: 'cmd+s',
      permissions: ['stats.view']
    },
    {
      id: 'photo',
      label: 'Tomar Foto',
      icon: CameraIcon,
      action: (context: any) => {
        console.log('Tomando foto:', context.precintoId);
      },
      color: 'bg-indigo-600 hover:bg-indigo-500',
      shortcut: 'cmd+p',
      permissions: ['photo.take'],
      disabled: selectedPrecinto === 'PE11223344'
    }
  ];

  // Manejar click derecho
  const handleContextMenu = (e: React.MouseEvent, precintoId: string) => {
    e.preventDefault();
    setSelectedPrecinto(precintoId);
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setRadialMenuOpen(true);
  };

  // Simular permisos del usuario
  React.useEffect(() => {
    setUserPermissions([
      'precinto.view',
      'precinto.lock',
      'alert.create',
      'report.create',
      'stats.view',
      'photo.take'
    ]);
  }, [setUserPermissions]);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Demo de Mejoras UX - Panel CMO
        </h1>

        {/* Instrucciones */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Instrucciones:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Click derecho en cualquier precinto para abrir el menú radial</li>
            <li>• Las acciones del menú copiarán datos al portapapeles inteligente</li>
            <li>• Click en el botón flotante (esquina inferior derecha) para ver el historial</li>
            <li>• Usa Cmd/Ctrl + Shift + V para abrir rápidamente el portapapeles</li>
            <li>• El portapapeles detecta automáticamente el tipo de contenido</li>
          </ul>
        </div>

        {/* Lista de Precintos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {precintos.map((precinto) => (
            <div
              key={precinto.id}
              className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors"
              onContextMenu={(e) => handleContextMenu(e, precinto.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <TruckIcon className="w-8 h-8 text-blue-500" />
                {precinto.alerts > 0 && (
                  <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span className="text-sm">{precinto.alerts}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {precinto.id}
              </h3>
              
              <div className="space-y-1 text-sm text-gray-400">
                <p>Estado: <span className={
                  precinto.status === 'ACTIVO' ? 'text-green-500' :
                  precinto.status === 'VIOLADO' ? 'text-red-500' :
                  'text-yellow-500'
                }>{precinto.status}</span></p>
                <p>Lat: {precinto.location.lat.toFixed(6)}</p>
                <p>Lng: {precinto.location.lng.toFixed(6)}</p>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Click derecho para acciones
              </div>
            </div>
          ))}
        </div>

        {/* Ejemplo de datos para copiar */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Datos de ejemplo para probar el portapapeles:
          </h2>
          <div className="space-y-3">
            <div className="bg-gray-700 p-3 rounded font-mono text-sm text-gray-300">
              PRECINTO: PE99887766 - ESTADO: ACTIVO - LAT: -34.603722 LON: -58.381592
            </div>
            <div className="bg-gray-700 p-3 rounded font-mono text-sm text-gray-300">
              ALERTA #1234 - SEVERIDAD: CRITICA - TIPO: VIOLACION
            </div>
            <div className="bg-gray-700 p-3 rounded font-mono text-sm text-gray-300">
              REPORTE #567 - FECHA: 2024-01-15 - OPERADOR: Juan Pérez
            </div>
            <div className="bg-gray-700 p-3 rounded font-mono text-sm text-gray-300">
              {"{ \"id\": \"PE12345678\", \"status\": \"active\", \"temperature\": 23.5 }"}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Selecciona y copia cualquier texto para ver la detección automática
          </p>
        </div>
      </div>

      {/* Radial Menu */}
      <RadialMenu
        actions={radialActions}
        position={menuPosition}
        isOpen={radialMenuOpen}
        onClose={() => setRadialMenuOpen(false)}
        context={{ precintoId: selectedPrecinto }}
        size="medium"
        animationPreset="smooth"
        customizable={true}
        gestureEnabled={true}
      />

      {/* Smart Clipboard */}
      <SmartClipboard
        maxHistory={50}
        syncEnabled={true}
        position="bottom-right"
        hotkeys={true}
      />
    </div>
  );
};