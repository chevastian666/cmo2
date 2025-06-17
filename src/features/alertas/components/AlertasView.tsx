import React from 'react';
import { AlertCircle, AlertTriangle, Shield, Battery, MapPin, Thermometer, Radio, Package } from 'lucide-react';
import { useAlertas } from '../../../store/hooks';
import { formatDateTime } from '../../../utils/formatters';
import { cn } from '../../../utils/utils';
import type { Alerta } from '../../../types';

export const AlertasView: React.FC = () => {
  const { alertas, loading, filter, actions } = useAlertas();
  
  const getIcon = (tipo: Alerta['tipo']) => {
    switch (tipo) {
      case 'violacion':
        return <Shield className="h-5 w-5" />;
      case 'bateria_baja':
        return <Battery className="h-5 w-5" />;
      case 'fuera_de_ruta':
        return <MapPin className="h-5 w-5" />;
      case 'temperatura':
        return <Thermometer className="h-5 w-5" />;
      case 'sin_signal':
        return <Radio className="h-5 w-5" />;
      case 'intrusion':
        return <Package className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStyles = (severidad: Alerta['severidad']) => {
    switch (severidad) {
      case 'critica':
        return 'bg-red-900/20 border-red-800 text-red-400';
      case 'alta':
        return 'bg-orange-900/20 border-orange-800 text-orange-400';
      case 'media':
        return 'bg-yellow-900/20 border-yellow-800 text-yellow-400';
      case 'baja':
        return 'bg-blue-900/20 border-blue-800 text-blue-400';
    }
  };

  const handleFilterChange = (key: keyof typeof filter, value: any) => {
    actions.setFilter({ ...filter, [key]: value });
    actions.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando alertas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Centro de Alertas</h2>
        <p className="text-gray-400 mt-1">Gestión completa de todas las alertas del sistema</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
            <select 
              className="bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white"
              value={filter.tipo || ''}
              onChange={(e) => handleFilterChange('tipo', e.target.value || undefined)}
            >
              <option value="">Todos</option>
              <option value="violacion">Violación</option>
              <option value="bateria_baja">Batería Baja</option>
              <option value="fuera_de_ruta">Fuera de Ruta</option>
              <option value="sin_signal">Sin Señal</option>
              <option value="temperatura">Temperatura</option>
              <option value="intrusion">Intrusión</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Severidad</label>
            <select 
              className="bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white"
              value={filter.severidad || ''}
              onChange={(e) => handleFilterChange('severidad', e.target.value || undefined)}
            >
              <option value="">Todas</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
            <select 
              className="bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-white"
              value={filter.atendida === undefined ? '' : filter.atendida.toString()}
              onChange={(e) => handleFilterChange('atendida', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">Todas</option>
              <option value="false">Activas</option>
              <option value="true">Atendidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Alertas</p>
              <p className="text-2xl font-semibold text-white mt-1">{alertas.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Críticas</p>
              <p className="text-2xl font-semibold text-red-400 mt-1">
                {alertas.filter((a) => a.severidad === 'critica').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Activas</p>
              <p className="text-2xl font-semibold text-yellow-400 mt-1">
                {alertas.filter((a) => !a.atendida).length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Atendidas</p>
              <p className="text-2xl font-semibold text-green-400 mt-1">
                {alertas.filter((a) => a.atendida).length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Listado de Alertas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Precinto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Mensaje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Severidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {alertas.map((alerta) => (
                <tr key={alerta.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn('flex items-center', getStyles(alerta.severidad))}>
                      {getIcon(alerta.tipo)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">
                      {alerta.codigoPrecinto}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300 max-w-xs truncate">
                      {alerta.mensaje}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      getStyles(alerta.severidad)
                    )}>
                      {alerta.severidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDateTime(alerta.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      alerta.atendida 
                        ? 'bg-green-900/20 border-green-800 text-green-400' 
                        : 'bg-yellow-900/20 border-yellow-800 text-yellow-400'
                    )}>
                      {alerta.atendida ? 'Atendida' : 'Activa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!alerta.atendida && (
                      <button
                        onClick={() => actions.atenderAlerta(alerta.id)}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        Atender
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};