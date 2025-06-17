import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Plus, XCircle } from 'lucide-react';
import { PrecintoTable } from '../components/PrecintoTable';
import { PrecintoFilters } from '../components/PrecintoFilters';
import { PrecintoDetailModal } from '../components/PrecintoDetailModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { precintosService } from '../services/precintos.service';
import { PrecintoStatus } from '../types';
import type { Precinto, PrecintoFilters as PrecintoFiltersType } from '../types';

export const PrecintosPage: React.FC = () => {
  
  const [precintos, setPrecintos] = useState<Precinto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PrecintoFiltersType>({});
  const [selectedPrecinto, setSelectedPrecinto] = useState<Precinto | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [exporting, setExporting] = useState(false);


  // Unique empresas and ubicaciones for filters
  const empresas = [...new Set(precintos.map(p => p.empresa).filter(Boolean))] as string[];
  const ubicaciones = [...new Set(precintos.map(p => p.ubicacion).filter(Boolean))] as string[];

  useEffect(() => {
    loadPrecintos();
  }, [filters]);

  const loadPrecintos = async () => {
    try {
      setLoading(true);
      const data = await precintosService.getPrecintos(filters);
      setPrecintos(data);
    } catch (error) {
      console.error('Error loading precintos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (precinto: Precinto) => {
    setSelectedPrecinto(precinto);
    setShowDetailModal(true);
  };

  const handleViewMap = (precinto: Precinto) => {
    if (precinto.gps) {
      // In a real app, this would open a map modal or navigate to a map view
      console.log('View map for precinto:', precinto.id, precinto.gps);
      alert(`Ver en mapa: Precinto ${precinto.id}\nLat: ${precinto.gps.lat}\nLng: ${precinto.gps.lng}`);
    }
  };

  const handleAssign = (precinto: Precinto) => {
    // In a real app, this would open an assignment modal
    console.log('Assign precinto:', precinto.id);
    alert(`Asignar precinto ${precinto.id}`);
  };

  const handleSendCommand = (precinto: Precinto) => {
    // In a real app, this would open a command modal
    console.log('Send command to precinto:', precinto.id);
    alert(`Enviar comando a precinto ${precinto.id}`);
  };

  const handleViewHistory = (precinto: Precinto) => {
    // In a real app, this would open a history modal
    console.log('View history for precinto:', precinto.id);
    alert(`Ver historial de precinto ${precinto.id}`);
  };

  const handleMarkAsBroken = async (precinto: Precinto) => {
    const confirmMessage = `¿Está seguro que desea marcar el precinto ${precinto.id} (${precinto.nserie}) como roto/inutilizable?\n\nEsta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      try {
        const success = await precintosService.updatePrecinto(precinto.id, {
          status: PrecintoStatus.ROTO,
          bateria: 0
        });
        
        if (success) {
          alert(`Precinto ${precinto.id} marcado como roto`);
          loadPrecintos(); // Reload the list
        } else {
          alert('Error al marcar el precinto como roto');
        }
      } catch (error) {
        console.error('Error marking precinto as broken:', error);
        alert('Error al marcar el precinto como roto');
      }
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const csv = await precintosService.exportToCSV(filters);
      
      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `precintos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting precintos:', error);
      alert('Error al exportar precintos');
    } finally {
      setExporting(false);
    }
  };

  console.log('PrecintosPage: About to return JSX');
  
  try {
    return (
      <div className="space-y-6">
        {console.log('PrecintosPage: Inside main div')}
        {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Precintos</h1>
          <p className="text-gray-400 mt-1">Gestión y monitoreo de precintos electrónicos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadPrecintos}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nuevo Precinto
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Precintos</p>
              <p className="text-2xl font-semibold text-white mt-1">{precintos.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-500 text-lg font-bold">#</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Disponibles</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {precintos.filter(p => p.status === PrecintoStatus.LISTO).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">En Uso</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {precintos.filter(p => p.status === PrecintoStatus.ARMADO).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Con Alarma</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {precintos.filter(p => p.status === PrecintoStatus.ALARMA).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Rotos/Inutilizables</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {precintos.filter(p => p.status === PrecintoStatus.ROTO).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ErrorBoundary componentName="PrecintoFilters">
        <PrecintoFilters
          filters={filters}
          onFiltersChange={setFilters}
          empresas={empresas}
          ubicaciones={ubicaciones}
        />
      </ErrorBoundary>

      {/* Table */}
      <ErrorBoundary componentName="PrecintoTable">
        <PrecintoTable
          precintos={precintos}
          loading={loading}
          onViewDetail={handleViewDetail}
          onViewMap={handleViewMap}
          onAssign={handleAssign}
          onSendCommand={handleSendCommand}
          onViewHistory={handleViewHistory}
          onMarkAsBroken={handleMarkAsBroken}
        />
      </ErrorBoundary>

      {/* Detail Modal */}
      <ErrorBoundary componentName="PrecintoDetailModal">
        <PrecintoDetailModal
          precinto={selectedPrecinto}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPrecinto(null);
          }}
        />
      </ErrorBoundary>
    </div>
  );
  } catch (error) {
    console.error('PrecintosPage: Error rendering component:', error);
    return (
      <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
        <h2 className="text-red-400 font-bold mb-2">Error rendering PrecintosPage</h2>
        <p className="text-red-300">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
};