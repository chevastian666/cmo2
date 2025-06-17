import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Truck, 
  Filter,
  Image,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardContent, Badge, EmptyState, LoadingState } from '../../../components/ui';
import { useCamionesStore } from '../../../store/camionesStore';
import { FichaCamion } from './FichaCamion';
import { FormularioCamion } from './FormularioCamion';
import { cn } from '../../../utils/utils';
import type { FiltrosCamion, EstadoCamion } from '../types';
import { ESTADOS_CAMION, FILTROS_CAMION_DEFAULT } from '../types';

export const ListaCamiones: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosCamion>(FILTROS_CAMION_DEFAULT);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [camionSeleccionado, setCamionSeleccionado] = useState<string | null>(null);
  
  const { 
    camiones, 
    loading, 
    fetchCamiones, 
    updateEstadoCamion 
  } = useCamionesStore();

  useEffect(() => {
    fetchCamiones(filtros);
  }, [fetchCamiones, filtros]);

  const handleFiltrosChange = (nuevosFiltros: Partial<FiltrosCamion>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const handleEstadoChange = async (matricula: string, estado: EstadoCamion) => {
    await updateEstadoCamion(matricula, estado);
  };

  if (camionSeleccionado) {
    return (
      <FichaCamion 
        matricula={camionSeleccionado} 
        onClose={() => setCamionSeleccionado(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-500" />
            Base de Datos de Camiones
          </h2>
          <p className="text-gray-400 mt-1 text-base sm:text-lg">
            Registro y seguimiento de camiones en tránsitos precintados
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Registrar Camión</span>
        </button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => handleFiltrosChange({ busqueda: e.target.value })}
                placeholder="Buscar por matrícula..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por estado */}
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltrosChange({ estado: e.target.value as EstadoCamion | '' })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS_CAMION).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>

            {/* Filtro tránsitos recientes */}
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
              <input
                type="checkbox"
                checked={filtros.conTransitosRecientes}
                onChange={(e) => handleFiltrosChange({ conTransitosRecientes: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Con tránsitos recientes</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Lista de camiones */}
      {loading ? (
        <LoadingState message="Cargando camiones..." />
      ) : camiones.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-12 w-12" />}
          title="No se encontraron camiones"
          description="No hay camiones que coincidan con los filtros aplicados"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {camiones.map(camion => {
            const estadoConfig = ESTADOS_CAMION[camion.estado];
            return (
              <Card 
                key={camion.id} 
                className="hover:border-gray-600 transition-all cursor-pointer"
                onClick={() => setCamionSeleccionado(camion.matricula)}
              >
                <CardContent className="p-4">
                  {/* Imagen y matrícula */}
                  <div className="flex items-start gap-4 mb-4">
                    {camion.foto ? (
                      <img 
                        src={camion.foto} 
                        alt={camion.matricula}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {camion.matricula}
                      </h3>
                      <Badge 
                        variant={estadoConfig.color as any}
                        className="text-xs"
                      >
                        {estadoConfig.icon} {estadoConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Observaciones */}
                  {camion.observaciones && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {camion.observaciones}
                    </p>
                  )}

                  {/* Fecha actualización */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Actualizado: {camion.fechaActualizacion.toLocaleDateString('es-UY')}
                    </span>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="mt-3 flex gap-2">
                    <select
                      value={camion.estado}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleEstadoChange(camion.matricula, e.target.value as EstadoCamion);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(ESTADOS_CAMION).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <FormularioCamion onClose={() => setMostrarFormulario(false)} />
      )}
    </div>
  );
};