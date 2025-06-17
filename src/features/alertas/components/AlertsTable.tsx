import React, { useState } from 'react';
import { AlertTriangle, Shield, Battery, MapPin, Radio, Thermometer, Package, Clock, CheckCircle, Navigation, Pause, Zap, WifiOff, Satellite, Eye } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { formatTimeAgo, formatDateTime } from '../../../utils/formatters';
import type { Alerta } from '../../../types';
import { TIPOS_ALERTA } from '../../../types/monitoring';
import { DataTable, type Column } from '../../../components/DataTable';
import { useAlertasActivas, useAlertaExtendida } from '../../../store/hooks/useAlertas';
import { AlertaDetalleModal } from './AlertaDetalleModal';
import { ResponderAlertaModal } from './ResponderAlertaModal';
import { notificationService } from '../../../services/shared/notification.service';

export const AlertsTable: React.FC = () => {
  const { alertas, loading, error, actions } = useAlertasActivas();
  const [selectedAlertaId, setSelectedAlertaId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlertaForResponse, setSelectedAlertaForResponse] = useState<Alerta | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  const handleAlertClick = (alerta: Alerta) => {
    setSelectedAlertaId(alerta.id);
    setIsModalOpen(true);
  };

  const handleVerificar = (alerta: Alerta, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (alerta.atendida) {
      notificationService.info('Esta alerta ya fue atendida');
      return;
    }
    
    setSelectedAlertaForResponse(alerta);
    setIsResponseModalOpen(true);
  };

  const handleResponderAlerta = async (alertaId: string, motivoId: number, motivoDescripcion: string, observaciones?: string) => {
    try {
      await actions.atenderAlerta(alertaId);
      notificationService.success('Alerta respondida correctamente');
      
      // Log the response details (in a real app, this would be sent to the backend)
      console.log('Alert response:', {
        alertaId,
        motivoId,
        motivoDescripcion,
        observaciones,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      notificationService.error('Error al responder la alerta');
      console.error('Error responding to alert:', error);
      throw error;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAlertaId(null);
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'AAR': // Atraso en arribo de reporte
        return <Clock className="h-4 w-4" />;
      case 'BBJ': // Batería baja
        return <Battery className="h-4 w-4" />;
      case 'DEM': // Demorado
        return <Pause className="h-4 w-4" />;
      case 'DNR': // Desvío de ruta
        return <Navigation className="h-4 w-4" />;
      case 'DTN': // Detenido
        return <Shield className="h-4 w-4" />;
      case 'NPG': // Sin señal GPS
        return <Satellite className="h-4 w-4" />;
      case 'NPN': // Sin reporte del precinto
        return <WifiOff className="h-4 w-4" />;
      case 'PTN': // Precinto abierto no autorizado
        return <Package className="h-4 w-4" />;
      case 'SNA': // Salida no autorizada
        return <Zap className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return 'text-red-400 bg-red-900/20';
      case 'alta':
        return 'text-orange-400 bg-orange-900/20';
      case 'media':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'baja':
        return 'text-blue-400 bg-blue-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const columns: Column<Alerta>[] = [
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: Object.entries(TIPOS_ALERTA).map(([key, value]) => ({
        value: key,
        label: value
      })),
      width: '120px',
      accessor: (item) => (
        <div className="flex items-center space-x-2">
          <div className={cn('p-1.5 rounded', getSeveridadColor(item.severidad))}>
            {getIcon(item.tipo)}
          </div>
          <span className="text-sm">{item.tipo}</span>
        </div>
      )
    },
    {
      key: 'codigoPrecinto',
      header: 'Precinto',
      sortable: true,
      filterable: true,
      accessor: (item) => <span className="font-medium text-white">{item.codigoPrecinto}</span>
    },
    {
      key: 'severidad',
      header: 'Severidad',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'critica', label: 'Crítica' },
        { value: 'alta', label: 'Alta' },
        { value: 'media', label: 'Media' },
        { value: 'baja', label: 'Baja' }
      ],
      width: '120px',
      accessor: (item) => (
        <span className={cn(
          'inline-flex px-2 py-1 text-xs font-medium rounded-full',
          getSeveridadColor(item.severidad)
        )}>
          {item.severidad}
        </span>
      )
    },
    {
      key: 'mensaje',
      header: 'Mensaje',
      sortable: false,
      filterable: true,
      accessor: (item) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-300 truncate">{item.mensaje}</p>
        </div>
      )
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
      sortable: false,
      accessor: (item) => (
        item.ubicacion ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement map view functionality
              notificationService.info('Función de mapa próximamente');
            }}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Ver</span>
          </button>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )
      )
    },
    {
      key: 'timestamp',
      header: 'Tiempo',
      sortable: true,
      accessor: (item) => (
        <div className="text-sm">
          <div className="text-gray-300">{formatTimeAgo(item.timestamp)}</div>
          <div className="text-xs text-gray-500">{formatDateTime(item.timestamp)}</div>
        </div>
      )
    },
    {
      key: 'atendida',
      header: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'false', label: 'Activa' },
        { value: 'true', label: 'Atendida' }
      ],
      width: '100px',
      accessor: (item) => (
        <span className={cn(
          'inline-flex px-2 py-1 text-xs font-medium rounded-full',
          item.atendida ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
        )}>
          {item.atendida ? 'Atendida' : 'Activa'}
        </span>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      sortable: false,
      width: '120px',
      accessor: (item) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => handleVerificar(item, e)}
            disabled={item.atendida}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              item.atendida
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
            title={item.atendida ? 'Alerta ya verificada' : 'Responder alerta'}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Verificar</span>
          </button>
        </div>
      )
    }
  ];

  const handleExport = (data: Alerta[], format: 'csv' | 'json') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `alertas-${timestamp}`;
    
    if (format === 'csv') {
      const headers = ['Tipo', 'Precinto', 'Severidad', 'Mensaje', 'Ubicación', 'Fecha/Hora', 'Estado'];
      const rows = data.map(a => [
        a.tipo.replace('_', ' '),
        a.codigoPrecinto,
        a.severidad,
        a.mensaje,
        a.ubicacion ? `${a.ubicacion.lat.toFixed(4)}, ${a.ubicacion.lng.toFixed(4)}` : '',
        new Date(a.timestamp * 1000).toLocaleString('es-UY'),
        a.atendida ? 'Atendida' : 'Activa'
      ]);
      
      const csv = [headers, ...rows.map(row => row.map(cell => `"${cell}"`))].
        map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
    } else {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.json`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-700 h-16 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
        <p className="text-red-400">Error cargando alertas: {error}</p>
      </div>
    );
  }

  return (
    <>
      <DataTable
        data={alertas}
        columns={columns}
        searchKeys={['codigoPrecinto', 'mensaje']}
        searchPlaceholder="Buscar por precinto o mensaje..."
        title="Gestión de Alarmas"
        onExport={handleExport}
        onRowClick={handleAlertClick}
        emptyMessage="No hay alarmas registradas"
        defaultItemsPerPage={25}
        itemsPerPageOptions={[10, 25, 50, 100]}
        rowClassName={(item) => cn(
          'cursor-pointer',
          !item.atendida && 'border-l-4',
          !item.atendida && getSeveridadColor(item.severidad).replace('text-', 'border-')
        )}
      />

      {/* Alert Detail Modal */}
      {selectedAlertaId && (
        <AlertDetailModalWrapper
          alertaId={selectedAlertaId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}

      {/* Response Modal */}
      <ResponderAlertaModal
        alerta={selectedAlertaForResponse}
        isOpen={isResponseModalOpen}
        onClose={() => {
          setIsResponseModalOpen(false);
          setSelectedAlertaForResponse(null);
        }}
        onRespond={handleResponderAlerta}
      />
    </>
  );
};

// Wrapper component to handle the extended alert data
const AlertDetailModalWrapper: React.FC<{
  alertaId: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ alertaId, isOpen, onClose }) => {
  const { alerta, loading, actions } = useAlertaExtendida(alertaId);

  if (!alerta || loading) {
    return null;
  }

  return (
    <AlertaDetalleModal
      alerta={alerta}
      isOpen={isOpen}
      onClose={onClose}
      onAsignar={actions.asignar}
      onComentar={actions.comentar}
      onResolver={actions.resolver}
    />
  );
};