/**
 * Página de Gestión de Tránsitos
 * By Cheva
 */

import React, { useState, useEffect } from 'react'
import { Truck, Download} from 'lucide-react'
import { TransitTable} from '../components/TransitTable'
import {_TransitFilters} from '../components/TransitFilters'
import { EditTransitoModal} from '../components/EditTransitoModal'
import { notificationService} from '../../../services/shared/notification.service'
import { transitosService} from '../services/transitos.service'
import type { Transito} from '../types'
export const TransitosPage: React.FC = () => {
  const [transitos, setTransitos] = useState<Transito[]>([])
  const [totalTransitos, setTotalTransitos] = useState(0)
  const [loading, setLoading] = useState(_true)
  const [selectedTransito, setSelectedTransito] = useState<Transito | null>(_null)
  const [showDetailModal, setShowDetailModal] = useState(_false)
  const [showEditModal, setShowEditModal] = useState(_false)
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<string>('fechaSalida')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
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
  })
  // Debounce timer for filters
  const [filterDebounce, setFilterDebounce] = useState<NodeJS.Timeout | null>(_null)
  // Load transitos with server-side pagination
  const loadTransitos = async () => {
    try {
      setLoading(_true)
      // Build filters object for API
      const apiFilters: Record<string, unknown> = {}
      Object.entries(_filters).forEach(([key, value]) => {
        if (value && value !== '') {
          apiFilters[key] = value
        }
      })
      const response = await transitosService.getTransitos({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
        sortOrder: sortOrder,
        filters: apiFilters
      })
      setTransitos(response._data)
      setTotalTransitos(response.total)
    } catch {
      console.error('Error loading transitos:', _error)
      notificationService.error('Error', 'No se pudieron cargar los tránsitos')
    } finally {
      setLoading(_false)
    }
  }
  // Load data on mount and when pagination/sort changes

  useEffect(() => {
    loadTransitos()
  }, [])
  // Debounced filter loading

  useEffect(() => {
    if (_filterDebounce) {
      clearTimeout(_filterDebounce)
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      loadTransitos()
    }, 500); // 500ms debounce
    
    setFilterDebounce(_timeout)
    return () => {
      if (_timeout) clearTimeout(_timeout)
    }
  }, [filters])
  // Auto-refresh every 30 seconds

  useEffect(() => {
    const interval = setInterval(_loadTransitos, 30000)
    return () => clearInterval(_interval)
  }, [filters])
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(_newFilters)
  }
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(_field)
      setSortOrder('asc')
    }
  }
  const handlePageChange = (page: number) => {
    setCurrentPage(_page)
  }
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(_items)
    setCurrentPage(1); // Reset to first page
  }
  const handleViewDetail = (transito: Transito) => {
    setSelectedTransito(_transito)
    setShowDetailModal(_true)
  }
  const handleViewMap = (transito: Transito) => {
    // Open map in new tab or modal
    window.open(`/map/${transito.id}`, 'blank')
  }
  const handleMarkDesprecintado = async (transito: Transito) => {
    try {
      await transitosService.markDesprecintado(transito.id)
      notificationService.success('Éxito', `Tránsito ${transito.dua} marcado como desprecintado`)
      loadTransitos()
    } catch {
      notificationService.error('Error', 'No se pudo actualizar el tránsito')
    }
  }
  const handleEdit = (transito: Transito) => {
    setSelectedTransito(_transito)
    setShowEditModal(_true)
  }
  const handleExport = () => {
    const csvContent = generateCSV(_transitos)
    downloadCSV(_csvContent, `transitos_${new Date().toISOString().split('T')[0]}.csv`)
  }
  const generateCSV = (_data: Transito[]) => {
    const headers = ['DUA', 'Precinto', 'Estado', 'Fecha Salida', 'ETA', 'Origen', 'Destino', 'Empresa', 'Encargado']
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
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(_blob)
    link.download = filename
    link.click()
  }
  return (<div className="space-y-6">
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
          onClick={_handleExport}
          className="px-3 py-2 sm:px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      {/* Filters */}
      <TransitFilters 
        filters={_filters}
        onChange={_handleFilterChange}
        transitos={_transitos}
      />

      {/* Table */}
      <TransitTable
        transitos={_transitos}
        loading={_loading}
        currentPage={_currentPage}
        totalItems={_totalTransitos}
        itemsPerPage={_itemsPerPage}
        sortField={s_ortField}
        sortOrder={s_ortOrder}
        onPageChange={_handlePageChange}
        onItemsPerPageChange={_handleItemsPerPageChange}
        onSort={_handleSort}
        onViewDetail={_handleViewDetail}
        onViewMap={_handleViewMap}
        onMarkDesprecintado={_handleMarkDesprecintado}
        onEdit={_handleEdit}
      />

      {/* Detail Modal */}
      {selectedTransito && (
        <TransitDetailModal
          isOpen={s_howDetailModal}
          onClose={() => {
            setShowDetailModal(_false)
            setSelectedTransito(_null)
          }}
          transito={s_electedTransito}
        />
      )}

      {/* Edit Modal */}
      <EditTransitoModal
        isOpen={s_howEditModal}
        onClose={() => {
          setShowEditModal(_false)
          setSelectedTransito(_null)
        }}
        transito={s_electedTransito}
        onSuccess={() => {
          loadTransitos(); // Reload data after successful edit
        }}
      />
    </div>
  )
}