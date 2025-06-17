import React from 'react';
import { Search, Filter, Calendar, Building2, Star, Lock, RotateCcw } from 'lucide-react';
import { cn } from '../../../utils/utils';
import type { FiltrosDocumentos, TipoDocumento } from '../types';
import { TIPOS_DOCUMENTO, FILTROS_DEFAULT } from '../types';

interface FiltrosDocumentosProps {
  filtros: FiltrosDocumentos;
  onFiltrosChange: (filtros: FiltrosDocumentos) => void;
  empresas: string[];
  className?: string;
}

export const FiltrosDocumentosComponent: React.FC<FiltrosDocumentosProps> = ({
  filtros,
  onFiltrosChange,
  empresas,
  className
}) => {
  const handleChange = (key: keyof FiltrosDocumentos, value: any) => {
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
           filtros.tipo !== '' ||
           filtros.numeroDUA !== '' ||
           filtros.empresa !== '' ||
           filtros.fechaDesde !== null ||
           filtros.fechaHasta !== null ||
           filtros.soloDestacados ||
           !filtros.incluirConfidenciales ||
           filtros.estado !== 'activo';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Búsqueda global */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          type="text"
          value={filtros.busqueda}
          onChange={(e) => handleChange('busqueda', e.target.value)}
          placeholder="Buscar por descripción, palabras clave, DUA..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-3">
        {/* Tipo de documento */}
        <select
          value={filtros.tipo}
          onChange={(e) => handleChange('tipo', e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TIPOS_DOCUMENTO).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        {/* Número de DUA */}
        <input
          type="text"
          value={filtros.numeroDUA}
          onChange={(e) => handleChange('numeroDUA', e.target.value)}
          placeholder="Número DUA"
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Empresa */}
        <select
          value={filtros.empresa}
          onChange={(e) => handleChange('empresa', e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las empresas</option>
          {empresas.map(empresa => (
            <option key={empresa} value={empresa}>{empresa}</option>
          ))}
        </select>

        {/* Fecha desde */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          <input
            type="date"
            value={filtros.fechaDesde ? filtros.fechaDesde.toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('fechaDesde', e.target.value ? new Date(e.target.value) : null)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Desde"
          />
        </div>

        {/* Fecha hasta */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          <input
            type="date"
            value={filtros.fechaHasta ? filtros.fechaHasta.toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('fechaHasta', e.target.value ? new Date(e.target.value) : null)}
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Hasta"
          />
        </div>

        {/* Estado */}
        <select
          value={filtros.estado}
          onChange={(e) => handleChange('estado', e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="activo">Activos</option>
          <option value="archivado">Archivados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {/* Opciones adicionales */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filtros.soloDestacados}
            onChange={(e) => handleChange('soloDestacados', e.target.checked)}
            className="w-4 h-4 text-yellow-600 bg-gray-800 border-gray-700 rounded focus:ring-yellow-500"
          />
          <Star className={cn(
            "h-4 w-4",
            filtros.soloDestacados ? "text-yellow-500" : "text-gray-500"
          )} />
          <span className={cn(
            "text-sm",
            filtros.soloDestacados ? "text-yellow-400" : "text-gray-400"
          )}>
            Solo destacados
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filtros.incluirConfidenciales}
            onChange={(e) => handleChange('incluirConfidenciales', e.target.checked)}
            className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
          />
          <Lock className={cn(
            "h-4 w-4",
            filtros.incluirConfidenciales ? "text-red-500" : "text-gray-500"
          )} />
          <span className={cn(
            "text-sm",
            filtros.incluirConfidenciales ? "text-red-400" : "text-gray-400"
          )}>
            Incluir confidenciales
          </span>
        </label>

        {tienesFiltrosActivos() && (
          <button
            onClick={handleReset}
            className="ml-auto flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};