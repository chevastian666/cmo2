import React, { useState, Fragment } from 'react';
import { ChevronUp, ChevronDown, MapPin, Eye, Send, History, Unlink, XCircle } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { PrecintoStatusBadge } from './PrecintoStatusBadge';
import { BatteryIndicator } from './BatteryIndicator';
import { SignalIndicator } from './SignalIndicator';
import { PrecintoStatus } from '../types';
import type { Precinto } from '../types';

interface PrecintoTableProps {
  precintos: Precinto[];
  loading: boolean;
  onViewDetail: (precinto: Precinto) => void;
  onViewMap: (precinto: Precinto) => void;
  onAssign: (precinto: Precinto) => void;
  onSendCommand: (precinto: Precinto) => void;
  onViewHistory: (precinto: Precinto) => void;
  onMarkAsBroken?: (precinto: Precinto) => void;
}

type SortField = keyof Precinto;

export const PrecintoTable: React.FC<PrecintoTableProps> = ({
  precintos,
  loading,
  onViewDetail,
  onViewMap,
  onAssign,
  onSendCommand,
  onViewHistory,
  onMarkAsBroken
}) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPrecintos = [...precintos].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (aValue === undefined) aValue = '';
    if (bValue === undefined) bValue = '';

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedPrecintos = sortedPrecintos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(sortedPrecintos.length / itemsPerPage));

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Cargando precintos...</p>
      </div>
    );
  }

  if (precintos.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <Unlink className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No se encontraron precintos</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <SortableHeader field="id">ID</SortableHeader>
              <SortableHeader field="nserie">N° Serie</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Batería
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Señal
              </th>
              <SortableHeader field="telefono">Teléfono</SortableHeader>
              <SortableHeader field="ultimoReporte">Últ. Reporte</SortableHeader>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedPrecintos.map((precinto) => (
              <tr key={precinto.id} className={cn(
                "hover:bg-gray-700/50 transition-colors",
                precinto.status === PrecintoStatus.ROTO && "bg-red-900/20 hover:bg-red-900/30"
              )}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PrecintoStatusBadge status={precinto.status} size="sm" showText={false} />
                    {precinto.status === PrecintoStatus.ROTO && (
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wide animate-pulse">
                        ROTO
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  <span className={cn(
                    "font-medium",
                    precinto.status === PrecintoStatus.ROTO ? "text-red-400 line-through" : "text-white"
                  )}>
                    {precinto.id}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  <span className={cn(
                    precinto.status === PrecintoStatus.ROTO ? "text-red-400 line-through" : "text-gray-300"
                  )}>
                    {precinto.nserie}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <BatteryIndicator level={precinto.bateria} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <SignalIndicator strength={precinto.signal} size="sm" />
                </td>
                <td className={cn(
                  "px-4 py-3 text-sm",
                  precinto.status === PrecintoStatus.ROTO ? "text-red-400/60" : "text-gray-300"
                )}>
                  {precinto.telefono}
                </td>
                <td className={cn(
                  "px-4 py-3 text-sm",
                  precinto.status === PrecintoStatus.ROTO ? "text-red-400/60" : "text-gray-300"
                )}>
                  {precinto.ultimoReporte || '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetail(precinto)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4 text-gray-400" />
                    </button>
                    {precinto.gps && (
                      <button
                        onClick={() => onViewMap(precinto)}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        title="Ver en mapa"
                      >
                        <MapPin className="h-4 w-4 text-blue-400" />
                      </button>
                    )}
                    <button
                      onClick={() => onSendCommand(precinto)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Enviar comando"
                    >
                      <Send className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => onViewHistory(precinto)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Ver historial"
                    >
                      <History className="h-4 w-4 text-gray-400" />
                    </button>
                    {onMarkAsBroken && precinto.status !== PrecintoStatus.ROTO && (
                      <button
                        onClick={() => onMarkAsBroken(precinto)}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        title="Marcar como roto"
                      >
                        <XCircle className="h-4 w-4 text-orange-400" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, precintos.length)} de {precintos.length} precintos
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                Math.abs(page - currentPage) <= 1
              )
              .map((page, index, array) => (
                <Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 py-1 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "px-3 py-1 rounded text-sm",
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
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};