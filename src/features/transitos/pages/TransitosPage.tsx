/**
 * Página de Gestión de Tránsitos
 * By Cheva
 */

import React, { useState, useEffect } from 'react';
import { Truck, Download, MapPin } from 'lucide-react';
import { TransitTable } from '../components/TransitTable';
import { TransitFilters } from '../components/TransitFilters';
import { TransitDetailModalEnhanced as TransitDetailModal } from '../components/TransitoDetailModalEnhanced';
import { EditTransitoModal } from '../components/EditTransitoModal';
import { notificationService } from '../../../services/shared/notification.service';
import { transitosService } from '../services/transitos.service';
import type { Transito } from '../types';

export const TransitosPage: React.FC = () => {
  const [transitos, setTransitos] = useState<Transito[]>([]);
  const [totalTransitos, setTotalTransitos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTransito, setSelectedTransito] = useState<Transito | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>('fechaSalida');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filters state
  const [filters, setFilters] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    precinto: '',
    empresa: '',
    origen: '',
    destino: '',
    searchText: ''
  });
  
  // Debounce timer for filters
  const [filterDebounce, setFilterDebounce] = useState<NodeJS.Timeout | null>(null);

  // Load transitos with server-side pagination
  const loadTransitos = async () => {
    try {
      setLoading(true);
      
      // Build filters object for API
      const apiFilters: Record<string, any> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          apiFilters[key] = value;
        }
      });
      
      const response = await transitosService.getTransitos({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
        sortOrder: sortOrder,
        filters: apiFilters
      });
      
      setTransitos(response.data);
      setTotalTransitos(response.total);
    } catch (error) {
      console.error('Error loading transitos:', error);
      notificationService.error('Error', 'No se pudieron cargar los tránsitos');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when pagination/sort changes
  useEffect(() => {
    loadTransitos();
  }, [currentPage, itemsPerPage, sortField, sortOrder]);

  // Debounced filter loading
  useEffect(() => {
    if (filterDebounce) {
      clearTimeout(filterDebounce);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      loadTransitos();
    }, 500); // 500ms debounce
    
    setFilterDebounce(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadTransitos, 30000);
    return () => clearInterval(interval);
  }, [currentPage, itemsPerPage, sortField, sortOrder, filters]);


  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  const handleViewDetail = (transito: Transito) => {
    setSelectedTransito(transito);
    setShowDetailModal(true);
  };

  const handleViewMap = (transito: Transito) => {
    // Open map in new tab or modal
    window.open(`/map/${transito.id}`, '_blank');
  };

  const handleMarkDesprecintado = async (transito: Transito) => {
    try {
      await transitosService.markDesprecintado(transito.id);
      notificationService.success('Éxito', `Tránsito ${transito.dua} marcado como desprecintado`);
      loadTransitos();
    } catch (error) {
      notificationService.error('Error', 'No se pudo actualizar el tránsito');
    }
  };

  const handleEdit = (transito: Transito) => {
    setSelectedTransito(transito);
    setShowEditModal(true);
  };

  const handleExport = () => {
    const csvContent = generateCSV(transitos);
    downloadCSV(csvContent, `transitos_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generateCSV = (data: Transito[]) => {
    const headers = ['DUA', 'Precinto', 'Estado', 'Fecha Salida', 'ETA', 'Origen', 'Destino', 'Empresa', 'Encargado'];
    const rows = data.map(t => [
      t.dua,
      t.precinto,
      t.estado,
      new Date(t.fechaSalida).toLocaleDateString(),
      t.eta ? new Date(t.eta).toLocaleDateString() : 'N/A',
      t.origen,
      t.destino,
      t.empresa,
      t.encargado
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            Tránsitos
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Historial completo de todos los tránsitos precintados
          </p>
        </div>
        
        <button
          onClick={handleExport}
          className="px-3 py-2 sm:px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      {/* Filters */}
      <TransitFilters 
        filters={filters}
        onChange={handleFilterChange}
        transitos={transitos}
      />

      {/* Table */}
      <TransitTable
        transitos={transitos}
        loading={loading}
        currentPage={currentPage}
        totalItems={totalTransitos}
        itemsPerPage={itemsPerPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSort={handleSort}
        onViewDetail={handleViewDetail}
        onViewMap={handleViewMap}
        onMarkDesprecintado={handleMarkDesprecintado}
        onEdit={handleEdit}
      />

      {/* Detail Modal */}
      {selectedTransito && (
        <TransitDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTransito(null);
          }}
          transito={selectedTransito}
        />
      )}

      {/* Edit Modal */}
      <EditTransitoModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTransito(null);
        }}
        transito={selectedTransito}
        onSuccess={() => {
          loadTransitos(); // Reload data after successful edit
        }}
      />
    </div>
  );
};