import React, { Fragment, memo, useMemo } from 'react';
import { ChevronUp, ChevronDown, Unlock, Eye, Edit2, Truck } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { TransitStatus } from './TransitStatus';
import { TransitTableSkeleton } from './TransitTableSkeleton';
import type { Transito } from '../types';

interface TransitTableProps {
  transitos: Transito[];
  loading: boolean;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onSort: (field: string) => void;
  onViewDetail: (transito: Transito) => void;
  onViewMap: (transito: Transito) => void;
  onMarkDesprecintado: (transito: Transito) => void;
  onEdit?: (transito: Transito) => void;
}


export const TransitTable: React.FC<TransitTableProps> = memo(({
  transitos,
  loading,
  currentPage,
  totalItems,
  itemsPerPage,
  sortField,
  sortOrder,
  onPageChange,
  onItemsPerPageChange,
  onSort,
  onViewDetail,
  onViewMap,
  onMarkDesprecintado,
  onEdit
}) => {
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / itemsPerPage)), 
    [totalItems, itemsPerPage]
  );
  
  const paginationNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(page => 
        page === 1 || 
        page === totalPages || 
        Math.abs(page - currentPage) <= 1
      );
  }, [totalPages, currentPage]);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const getTimeRemaining = (eta?: string) => {
    if (!eta) return null;
    const now = new Date().getTime();
    const etaTime = new Date(eta).getTime();
    const diff = etaTime - now;
    
    if (diff < 0) return { text: 'Retrasado', color: 'text-red-400' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return { text: `${days}d ${hours % 24}h`, color: 'text-green-400' };
    } else if (hours > 12) {
      return { text: `${hours}h`, color: 'text-green-400' };
    } else if (hours > 3) {
      return { text: `${hours}h`, color: 'text-yellow-400' };
    } else {
      return { text: `${hours}h`, color: 'text-red-400' };
    }
  };

  if (loading) {
    return <TransitTableSkeleton />;
  }

  if (transitos.length === 0 && !loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <Truck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No se encontraron tránsitos</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              <th 
                onClick={() => onSort('dua')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  DUA
                  <SortIcon field="dua" />
                </div>
              </th>
              <th 
                onClick={() => onSort('precinto')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Precinto
                  <SortIcon field="precinto" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Viaje/MOV
              </th>
              <th 
                onClick={() => onSort('estado')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Estado
                  <SortIcon field="estado" />
                </div>
              </th>
              <th 
                onClick={() => onSort('fechaSalida')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Fecha Salida
                  <SortIcon field="fechaSalida" />
                </div>
              </th>
              <th 
                onClick={() => onSort('eta')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Fecha llegada
                  <SortIcon field="eta" />
                </div>
              </th>
              <th 
                onClick={() => onSort('origen')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Origen
                  <SortIcon field="origen" />
                </div>
              </th>
              <th 
                onClick={() => onSort('destino')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Destino
                  <SortIcon field="destino" />
                </div>
              </th>
              <th 
                onClick={() => onSort('empresa')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  Despachante
                  <SortIcon field="empresa" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {transitos.map((transito) => {
              const timeRemaining = getTimeRemaining(transito.eta);
              return (
                <tr key={transito.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {transito.dua}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-mono">
                    {transito.precinto}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-blue-400">
                        {transito.viaje || '-'}
                      </span>
                      <span className="text-xs text-gray-400">
                        MOV {transito.mov || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TransitStatus estado={transito.estado} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(transito.fechaSalida).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {transito.eta ? new Date(transito.eta).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {transito.origen}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {transito.destino}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {transito.empresa}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(transito)}
                          className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onViewDetail(transito)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        title="Ver tránsito"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {transito.estado === 'en_viaje' && (
                        <button
                          onClick={() => onMarkDesprecintado(transito)}
                          className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          title="Desprecintar"
                        >
                          <Unlock className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-700 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-400">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} tránsitos
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-gray-700 text-white text-xs sm:text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none self-start"
          >
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>
        <div className="flex gap-1 sm:gap-2 justify-center sm:justify-end">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded text-xs sm:text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Anterior</span>
            <span className="sm:hidden">←</span>
          </button>
          <div className="flex gap-1">
            {paginationNumbers.map((page, index, array) => (
                <Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-1 sm:px-2 py-1 text-gray-500 text-xs sm:text-sm">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={cn(
                      "px-2 sm:px-3 py-1 rounded text-xs sm:text-sm",
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    )}
                  >
                    {page}
                  </button>
                </Fragment>
              ))}
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded text-xs sm:text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>
      </div>
    </div>
  );
});

TransitTable.displayName = 'TransitTable';