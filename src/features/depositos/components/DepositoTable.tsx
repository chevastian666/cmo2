import React, { useState } from 'react';
import { MapPin, Eye, Edit, ArrowUpDown, ExternalLink, Building2 } from 'lucide-react';
import type { Deposito } from '../types';
import { cn } from '../../../utils/utils';

interface DepositoTableProps {
  depositos: Deposito[];
  loading: boolean;
  onView: (deposito: Deposito) => void;
  onEdit: (deposito: Deposito) => void;
}

type SortField = 'codigo' | 'nombre' | 'zona' | 'transitosActivos';
type SortOrder = 'asc' | 'desc';

export const DepositoTable: React.FC<DepositoTableProps> = ({
  depositos,
  loading,
  onView,
  onEdit
}) => {
  const [sortField, setSortField] = useState<SortField>('codigo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedDepositos = [...depositos].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const paginatedDepositos = sortedDepositos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedDepositos.length / itemsPerPage);


  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Cargando depósitos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('codigo')}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wider hover:text-white"
                >
                  Código
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('nombre')}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wider hover:text-white"
                >
                  Nombre
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Alias
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ubicación
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('zona')}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wider hover:text-white"
                >
                  Padre
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('transitosActivos')}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wider hover:text-white"
                >
                  Tránsitos
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedDepositos.map((deposito) => (
              <tr key={deposito.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-white">{deposito.codigo}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-white">{deposito.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">{deposito.alias}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`https://www.google.com/maps?q=${deposito.lat},${deposito.lng}&z=17&hl=es`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <MapPin className="h-3 w-3" />
                    Ubicar
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300">{deposito.padre}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300">{deposito.transitosActivos}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                    deposito.estado === 'activo'
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  )}>
                    {deposito.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(deposito)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => onEdit(deposito)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, sortedDepositos.length)} de{' '}
              {sortedDepositos.length} depósitos
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "px-3 py-1 rounded",
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};