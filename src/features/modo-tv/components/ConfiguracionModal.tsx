import React from 'react';
import { X, Monitor, Volume2, Layout, MapPin } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { ConfiguracionTV } from '../types';
import { PUNTOS_OPERACION_TV } from '../types';

interface ConfiguracionModalProps {
  configuracion: ConfiguracionTV;
  onClose: () => void;
  onChange: (config: Partial<ConfiguracionTV>) => void;
}

export const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  configuracion,
  onClose,
  onChange
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-lg w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <Monitor className="h-6 w-6 text-blue-500" />
            Configuración Modo TV
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Punto de operación */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
              <MapPin className="h-4 w-4" />
              Punto de Operación
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  checked={configuracion.mostrarTodos}
                  onChange={() => onChange({ mostrarTodos: true, puntoOperacion: undefined })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-white">Mostrar todos los puntos</span>
              </label>
              
              <select
                value={configuracion.puntoOperacion || ''}
                onChange={(e) => onChange({ 
                  puntoOperacion: e.target.value || undefined,
                  mostrarTodos: !e.target.value 
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={configuracion.mostrarTodos}
              >
                <option value="">Seleccionar punto específico</option>
                {PUNTOS_OPERACION_TV.map(punto => (
                  <option key={punto} value={punto}>{punto}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
              <Layout className="h-4 w-4" />
              Diseño de Pantalla
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(cols => (
                <button
                  key={cols}
                  onClick={() => onChange({ columnas: cols as 1 | 2 | 3 })}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    configuracion.columnas === cols
                      ? "bg-blue-900/50 border-blue-600 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  )}
                >
                  <div className="flex justify-center mb-2">
                    <div className={cn(
                      "grid gap-1",
                      cols === 1 && "grid-cols-1",
                      cols === 2 && "grid-cols-2",
                      cols === 3 && "grid-cols-3"
                    )}>
                      {Array.from({ length: cols }).map((_, i) => (
                        <div key={i} className="w-8 h-12 bg-current opacity-50 rounded" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium">{cols} columna{cols > 1 ? 's' : ''}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sonido */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
              <Volume2 className="h-4 w-4" />
              Alertas Sonoras
            </label>
            <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={configuracion.sonidoAlertas}
                onChange={(e) => onChange({ sonidoAlertas: e.target.checked })}
                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-white font-medium">Activar sonido en alertas</p>
                <p className="text-sm text-gray-400">
                  Reproduce un sonido cuando aparezcan nuevas alertas críticas
                </p>
              </div>
            </label>
          </div>

          {/* Frecuencia de actualización */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-3 block">
              Frecuencia de Actualización
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={configuracion.actualizacionSegundos}
                onChange={(e) => onChange({ actualizacionSegundos: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-white font-mono w-16 text-right">
                {configuracion.actualizacionSegundos}s
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Los datos se actualizarán cada {configuracion.actualizacionSegundos} segundos
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};