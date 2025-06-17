import React from 'react';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Filter, 
  RotateCcw,
  User
} from 'lucide-react';
import { Badge } from '../../../components/ui';
import { cn } from '../../../utils/utils';
import type { FiltrosNovedades, TipoNovedad, EstadoNovedad } from '../types';
import { PUNTOS_OPERACION, TIPOS_NOVEDAD, FILTROS_DEFAULT } from '../types';

interface FiltrosNovedadesProps {
  filtros: FiltrosNovedades;
  onFiltrosChange: (filtros: FiltrosNovedades) => void;
  className?: string;
}

export const FiltrosNovedadesComponent: React.FC<FiltrosNovedadesProps> = ({
  filtros,
  onFiltrosChange,
  className
}) => {
  const handleChange = (key: keyof FiltrosNovedades, value: any) => {
    onFiltrosChange({
      ...filtros,
      [key]: value
    });
  };

  const handleReset = () => {
    onFiltrosChange(FILTROS_DEFAULT);
  };

  const tienesFiltrosActivos = () => {
    return filtros.busqueda !== '' ||
           filtros.puntoOperacion !== '' ||
           filtros.tipoNovedad !== '' ||
           filtros.estado !== '' ||
           filtros.fechaDesde !== null ||
           filtros.fechaHasta !== null ||
           filtros.soloMias;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          type="text"
          value={filtros.busqueda}
          onChange={(e) => handleChange('busqueda', e.target.value)}
          placeholder="Buscar por descripción o palabras clave..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-3">
        {/* Fecha específica */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          <input
            type="date"
            value={filtros.fecha instanceof Date ? filtros.fecha.toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('fecha', e.target.value ? new Date(e.target.value) : null)}
            className="pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Fecha"
          />
        </div>

        {/* Punto de operación */}
        <select
          value={filtros.puntoOperacion}
          onChange={(e) => handleChange('puntoOperacion', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los puntos</option>
          {PUNTOS_OPERACION.map(punto => (
            <option key={punto} value={punto}>{punto}</option>
          ))}
        </select>

        {/* Tipo de novedad */}
        <select
          value={filtros.tipoNovedad}
          onChange={(e) => handleChange('tipoNovedad', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TIPOS_NOVEDAD).map(([key, config]) => (
            <option key={key} value={key}>
              {config.icon} {config.label}
            </option>
          ))}
        </select>

        {/* Estado */}
        <select
          value={filtros.estado}
          onChange={(e) => handleChange('estado', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="activa">Activas</option>
          <option value="resuelta">Resueltas</option>
          <option value="seguimiento">En seguimiento</option>
        </select>

        {/* Solo mías */}
        <label className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
          <input
            type="checkbox"
            checked={filtros.soloMias}
            onChange={(e) => handleChange('soloMias', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
          />
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-300">Solo mías</span>
        </label>

        {/* Limpiar filtros */}
        {tienesFiltrosActivos() && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Rango de fechas (búsqueda histórica) */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Búsqueda histórica
          <span className="text-xs text-gray-500">(clic para expandir)</span>
        </summary>
        
        <div className="mt-3 p-3 bg-gray-800/50 rounded-lg flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Desde:</label>
            <input
              type="date"
              value={filtros.fechaDesde instanceof Date ? filtros.fechaDesde.toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('fechaDesde', e.target.value ? new Date(e.target.value) : null)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Hasta:</label>
            <input
              type="date"
              value={filtros.fechaHasta instanceof Date ? filtros.fechaHasta.toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('fechaHasta', e.target.value ? new Date(e.target.value) : null)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(filtros.fechaDesde || filtros.fechaHasta) && (
            <button
              onClick={() => {
                handleChange('fechaDesde', null);
                handleChange('fechaHasta', null);
                handleChange('fecha', null);
              }}
              className="text-xs text-gray-400 hover:text-white"
            >
              Limpiar fechas
            </button>
          )}
        </div>
      </details>
    </div>
  );
};