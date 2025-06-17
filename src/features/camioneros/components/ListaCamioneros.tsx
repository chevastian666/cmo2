import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  User, 
  Phone,
  MapPin,
  Calendar,
  Flag
} from 'lucide-react';
import { Card, CardHeader, CardContent, Badge, EmptyState, LoadingState } from '../../../components/ui';
import { useCamionerosStore } from '../../../store/camionerosStore';
import { FichaCamionero } from './FichaCamionero';
import { FormularioCamionero } from './FormularioCamionero';
import { cn } from '../../../utils/utils';
import type { FiltrosCamionero, Nacionalidad } from '../types';
import { NACIONALIDADES, FILTROS_CAMIONERO_DEFAULT } from '../types';

export const ListaCamioneros: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosCamionero>(FILTROS_CAMIONERO_DEFAULT);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [camioneroSeleccionado, setCamioneroSeleccionado] = useState<string | null>(null);
  
  const { 
    camioneros, 
    loading, 
    fetchCamioneros 
  } = useCamionerosStore();

  useEffect(() => {
    fetchCamioneros(filtros);
  }, [fetchCamioneros, filtros]);

  const handleFiltrosChange = (nuevosFiltros: Partial<FiltrosCamionero>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  if (camioneroSeleccionado) {
    return (
      <FichaCamionero 
        documento={camioneroSeleccionado} 
        onClose={() => setCamioneroSeleccionado(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <User className="h-8 w-8 text-blue-500" />
            Base de Datos de Camioneros
          </h2>
          <p className="text-gray-400 mt-1 text-base sm:text-lg">
            Registro y seguimiento de choferes en tránsitos precintados
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Registrar Camionero</span>
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
                placeholder="Buscar por nombre, apellido o documento..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por nacionalidad */}
            <select
              value={filtros.nacionalidad}
              onChange={(e) => handleFiltrosChange({ nacionalidad: e.target.value as Nacionalidad | '' })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las nacionalidades</option>
              {Object.entries(NACIONALIDADES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
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

      {/* Lista de camioneros */}
      {loading ? (
        <LoadingState message="Cargando camioneros..." />
      ) : camioneros.length === 0 ? (
        <EmptyState
          icon={<User className="h-12 w-12" />}
          title="No se encontraron camioneros"
          description="No hay camioneros que coincidan con los filtros aplicados"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {camioneros.map(camionero => (
            <Card 
              key={camionero.id} 
              className="hover:border-gray-600 transition-all cursor-pointer"
              onClick={() => setCamioneroSeleccionado(camionero.documento)}
            >
              <CardContent className="p-4">
                {/* Nombre y nacionalidad */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {camionero.nombre} {camionero.apellido}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Flag className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-400">
                        {NACIONALIDADES[camionero.nacionalidad]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                </div>

                {/* Documento */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Documento</p>
                  <p className="text-sm text-white font-mono">
                    {camionero.tipoDocumento}: {camionero.documento}
                  </p>
                </div>

                {/* Teléfonos */}
                <div className="space-y-1 mb-3">
                  {camionero.telefonoUruguayo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-300">🇺🇾 {camionero.telefonoUruguayo}</span>
                    </div>
                  )}
                  {camionero.telefonoPais && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-300">
                        {camionero.nacionalidad === 'Argentina' && '🇦🇷'}
                        {camionero.nacionalidad === 'Brasil' && '🇧🇷'}
                        {camionero.nacionalidad === 'Paraguay' && '🇵🇾'}
                        {camionero.nacionalidad === 'Chile' && '🇨🇱'}
                        {camionero.nacionalidad === 'Bolivia' && '🇧🇴'}
                        {' '}
                        {camionero.telefonoPais}
                      </span>
                    </div>
                  )}
                </div>

                {/* Comentario */}
                {camionero.comentario && (
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                    {camionero.comentario}
                  </p>
                )}

                {/* Fecha actualización */}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-800">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Actualizado: {camionero.fechaActualizacion.toLocaleDateString('es-UY')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <FormularioCamionero onClose={() => setMostrarFormulario(false)} />
      )}
    </div>
  );
};