import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, Building2 } from 'lucide-react';
import { DepositoTable } from '../components/DepositoTable';
import { DepositoFilters } from '../components/DepositoFilters';
import { DepositoDetailModal } from '../components/DepositoDetailModal';
import { DepositoFormModal } from '../components/DepositoFormModal';
import { useDepositosStore } from '../../../store/useDepositosStore';
import { exportToCSV } from '../../../utils/export';
import type { Deposito } from '../types';

export const DepositosPage: React.FC = () => {
  const { depositos, loading, addDeposito, updateDeposito } = useDepositosStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeposito, setSelectedDeposito] = useState<Deposito | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDeposito, setEditingDeposito] = useState<Deposito | null>(null);
  const [filters, setFilters] = useState({
    tipo: '',
    zona: '',
    padre: ''
  });

  const filteredDepositos = useMemo(() => {
    return depositos.filter(deposito => {
      const matchesSearch = searchTerm === '' || 
        deposito.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposito.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposito.codigo.toString().includes(searchTerm);
        
      const matchesTipo = !filters.tipo || deposito.tipo === filters.tipo;
      const matchesZona = !filters.zona || deposito.zona === filters.zona;
      const matchesPadre = !filters.padre || deposito.padre === filters.padre;
      
      return matchesSearch && matchesTipo && matchesZona && matchesPadre;
    });
  }, [depositos, searchTerm, filters]);

  const handleExport = () => {
    const data = filteredDepositos.map(d => ({
      Código: d.codigo,
      Nombre: d.nombre,
      Alias: d.alias,
      Ubicación: `${d.lat}, ${d.lng}`,
      Padre: d.padre,
      Tipo: d.tipo,
      Zona: d.zona,
      Empresa: d.empresa || '-',
      'Tránsitos Activos': d.transitosActivos,
      Estado: d.estado
    }));
    exportToCSV(data, 'depositos');
  };

  const handleView = (deposito: Deposito) => {
    setSelectedDeposito(deposito);
    setShowDetail(true);
  };

  const handleEdit = (deposito: Deposito) => {
    setEditingDeposito(deposito);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingDeposito(null);
    setShowForm(true);
  };

  const handleSave = (data: Partial<Deposito>) => {
    if (editingDeposito) {
      updateDeposito(editingDeposito.id, data);
    } else {
      addDeposito(data as Omit<Deposito, 'id'>);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Depósitos</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agregar Depósito
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o alias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {Object.values(filters).some(v => v !== '') && (
            <span className="bg-blue-600 text-xs rounded-full px-2 py-0.5">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <DepositoFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Depósitos</p>
              <p className="text-2xl font-bold text-white">{depositos.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tránsitos Activos</p>
              <p className="text-2xl font-bold text-white">
                {depositos.reduce((acc, d) => acc + d.transitosActivos, 0)}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DepositoTable
        depositos={filteredDepositos}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
      />

      {/* Detail Modal */}
      {showDetail && selectedDeposito && (
        <DepositoDetailModal
          deposito={selectedDeposito}
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          onEdit={() => {
            setShowDetail(false);
            handleEdit(selectedDeposito);
          }}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <DepositoFormModal
          deposito={editingDeposito}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};