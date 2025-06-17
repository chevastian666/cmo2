import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Search, Download, Filter, X } from 'lucide-react';
import { cn } from '../../utils/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { value: string; label: string }[];
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  onExport?: (data: T[], format: 'csv' | 'json') => void;
  className?: string;
  rowClassName?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  title?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = "Buscar...",
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 25,
  onExport,
  className,
  rowClassName,
  onRowClick,
  emptyMessage = "No se encontraron datos",
  title
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchKeys.length > 0) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        searchKeys.some(key => {
          const value = item[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(lowerSearch);
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue !== '' && filterValue != null) {
        filtered = filtered.filter(item => {
          const column = columns.find(col => col.key === key);
          if (!column) return true;

          const itemValue = column.accessor ? column.accessor(item) : item[key];
          
          if (column.filterType === 'select') {
            return String(itemValue) === String(filterValue);
          }
          
          if (column.filterType === 'number') {
            const numValue = Number(itemValue);
            const numFilter = Number(filterValue);
            return !isNaN(numValue) && !isNaN(numFilter) && numValue >= numFilter;
          }

          return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const column = columns.find(col => col.key === sortColumn);
        if (!column) return 0;

        const aValue = column.accessor ? column.accessor(a) : a[sortColumn];
        const bValue = column.accessor ? column.accessor(b) : b[sortColumn];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, searchKeys, filters, sortColumn, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, itemsPerPage]);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    
    if (sortColumn === column.key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column.key as string);
      setSortDirection('asc');
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (onExport) {
      onExport(filteredData, format);
    } else {
      // Default export implementation
      if (format === 'csv') {
        const headers = columns.map(col => col.header).join(',');
        const rows = filteredData.map(item => 
          columns.map(col => {
            const value = col.accessor ? col.accessor(item) : item[col.key];
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        );
        const csv = [headers, ...rows].join('\n');
        downloadFile(csv, `export-${Date.now()}.csv`, 'text/csv');
      } else {
        const json = JSON.stringify(filteredData, null, 2);
        downloadFile(json, `export-${Date.now()}.json`, 'application/json');
      }
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filterableColumns = columns.filter(col => col.filterable);

  return (
    <div className={cn("bg-gray-800 rounded-lg", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {title && <h3 className="text-xl font-semibold text-white">{title}</h3>}
          
          <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:max-w-xl">
            {/* Search */}
            {searchKeys.length > 0 && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Filter Toggle */}
            {filterableColumns.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "px-3 py-2 rounded-md border transition-colors flex items-center gap-2",
                  showFilters 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                )}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline text-base">Filtros</span>
                {Object.keys(filters).length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>
            )}

            {/* Export */}
            <div className="relative group">
              <button className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline text-base">Exportar</span>
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-gray-700 border border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-3 py-2 text-left text-base text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-3 py-2 text-left text-base text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && filterableColumns.length > 0 && (
          <div className="mt-4 p-4 bg-gray-700 rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filterableColumns.map((column) => (
                <div key={column.key as string}>
                  <label className="block text-base font-medium text-gray-300 mb-1">
                    {column.header}
                  </label>
                  {column.filterType === 'select' && column.filterOptions ? (
                    <select
                      value={filters[column.key] || ''}
                      onChange={(e) => setFilters({ ...filters, [column.key]: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      {column.filterOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={column.filterType === 'number' ? 'number' : 'text'}
                      value={filters[column.key] || ''}
                      onChange={(e) => setFilters({ ...filters, [column.key]: e.target.value })}
                      placeholder={`Filtrar por ${column.header.toLowerCase()}`}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => setFilters({})}
                className="mt-3 text-base text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:text-gray-300",
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-blue-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-base text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={cn(
                    "hover:bg-gray-700/50 transition-colors",
                    onRowClick && "cursor-pointer",
                    rowClassName && rowClassName(item, index)
                  )}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      className={cn("px-4 py-3 text-base text-gray-300", column.className)}
                    >
                      {column.accessor ? column.accessor(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Pagination */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-400">Mostrar</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className="text-base text-gray-400">
              de {filteredData.length} registros
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-400" />
            </button>
            
            <span className="text-base text-gray-400">
              Página {currentPage} de {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}