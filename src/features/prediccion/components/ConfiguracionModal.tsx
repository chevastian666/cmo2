import React, { useState } from 'react';
import { X, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { 
  Card,
  CardHeader,
  CardContent,
  InfoSection
} from '../../../components/ui';
import { congestionAnalyzer } from '../utils/congestionAnalyzer';
import { CONFIGURACION_DEFAULT } from '../types';
import type { ConfiguracionPrediccion } from '../types';

interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: ConfiguracionPrediccion) => void;
}

export const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [config, setConfig] = useState<ConfiguracionPrediccion>(CONFIGURACION_DEFAULT);
  const [nuevoDestino, setNuevoDestino] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    congestionAnalyzer.actualizarConfiguracion(config);
    onSave?.(config);
    onClose();
  };

  const handleReset = () => {
    setConfig(CONFIGURACION_DEFAULT);
  };

  const agregarDestino = () => {
    if (nuevoDestino && !config.destinosMonitoreados.includes(nuevoDestino)) {
      setConfig({
        ...config,
        destinosMonitoreados: [...config.destinosMonitoreados, nuevoDestino]
      });
      setNuevoDestino('');
    }
  };

  const eliminarDestino = (destino: string) => {
    setConfig({
      ...config,
      destinosMonitoreados: config.destinosMonitoreados.filter(d => d !== destino)
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-2xl w-full max-h-[90vh] overflow-hidden bg-gray-900">
          {/* Header */}
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Configuración de Análisis Predictivo
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Parámetros temporales */}
              <InfoSection title="Parámetros de Análisis">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ventana de tiempo (minutos)
                    </label>
                    <input
                      type="number"
                      value={config.ventanaTiempo}
                      onChange={(e) => setConfig({ ...config, ventanaTiempo: Number(e.target.value) })}
                      min="5"
                      max="60"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo para agrupar llegadas consecutivas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Horas de proyección
                    </label>
                    <input
                      type="number"
                      value={config.horasProyeccion}
                      onChange={(e) => setConfig({ ...config, horasProyeccion: Number(e.target.value) })}
                      min="1"
                      max="24"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cuántas horas hacia adelante analizar
                    </p>
                  </div>
                </div>
              </InfoSection>

              {/* Umbrales de severidad */}
              <InfoSection title="Umbrales de Severidad">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Umbral Bajo (Media)
                    </label>
                    <input
                      type="number"
                      value={config.umbralBajo}
                      onChange={(e) => setConfig({ ...config, umbralBajo: Number(e.target.value) })}
                      min="2"
                      max="10"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo de camiones para alerta media
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Umbral Medio (Alta)
                    </label>
                    <input
                      type="number"
                      value={config.umbralMedio}
                      onChange={(e) => setConfig({ ...config, umbralMedio: Number(e.target.value) })}
                      min="3"
                      max="15"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo de camiones para alerta alta
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Umbral Alto (Crítica)
                    </label>
                    <input
                      type="number"
                      value={config.umbralAlto}
                      onChange={(e) => setConfig({ ...config, umbralAlto: Number(e.target.value) })}
                      min="5"
                      max="20"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo de camiones para alerta crítica
                    </p>
                  </div>
                </div>
              </InfoSection>

              {/* Destinos monitoreados */}
              <InfoSection title="Destinos Monitoreados">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nuevoDestino}
                      onChange={(e) => setNuevoDestino(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && agregarDestino()}
                      placeholder="Agregar nuevo destino..."
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={agregarDestino}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {config.destinosMonitoreados.map(destino => (
                      <div key={destino} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                        <span className="text-gray-300">{destino}</span>
                        <button
                          onClick={() => eliminarDestino(destino)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </InfoSection>
            </div>
          </CardContent>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 flex justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restablecer
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};