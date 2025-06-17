import React from 'react';
import { formatTimeAgo } from '../../../utils/formatters';
import type { TransitoPendiente } from '../../../types/monitoring';
import { cn } from '../../../utils/utils';
import { Clock, Truck, MessageSquare } from 'lucide-react';
import { THRESHOLDS } from '../../../constants';
import { DataTable, type Column } from '../../../components/DataTable';

interface TransitosPendientesTableProps {
  transitos: TransitoPendiente[];
}

export const TransitosPendientesTable: React.FC<TransitosPendientesTableProps> = ({ transitos }) => {
  const getTiempoColor = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    // 0-30 minutos: verde
    if (diff <= THRESHOLDS.TIEMPO_PENDIENTE_VERDE) {
      return 'text-green-400';
    } 
    // 31-60 minutos: amarillo
    else if (diff <= THRESHOLDS.TIEMPO_PENDIENTE_AMARILLO) {
      return 'text-yellow-400';
    } 
    // 60+ minutos: rojo
    else {
      return 'text-red-400';
    }
  };

  const columns: Column<TransitoPendiente>[] = [
    {
      key: 'numeroViaje',
      header: 'N° de Viaje / MOV',
      sortable: true,
      filterable: true,
      accessor: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-blue-400">{item.numeroViaje}</span>
            {item.observaciones && (
              <div className="relative group">
                <MessageSquare className="h-4 w-4 text-yellow-400 animate-pulse" />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 pointer-events-none sm:left-full sm:ml-2 left-0 sm:top-1/2 top-full sm:-translate-y-1/2 sm:translate-y-0 translate-y-1">
                  <div className="bg-gray-900 text-white p-3 rounded-md shadow-xl max-w-xs w-64 sm:w-auto border border-gray-700">
                    <p className="text-xs font-medium mb-1 text-yellow-400">Observación del Puerto:</p>
                    <p className="text-xs text-gray-300 whitespace-normal">{item.observaciones}</p>
                    <div className="absolute sm:right-full sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:border-t-[6px] sm:border-t-transparent sm:border-b-[6px] sm:border-b-transparent sm:border-r-[6px] sm:border-r-gray-900 right-2 bottom-full translate-y-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-900 sm:border-l-0 sm:border-r-[6px] sm:border-b-0"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400">MOV: {item.mov}</div>
        </div>
      )
    },
    {
      key: 'dua',
      header: 'DUA',
      sortable: true,
      filterable: true,
      accessor: (item) => item.dua
    },
    {
      key: 'tipoCarga',
      header: 'Tipo de Carga',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'Contenedor', label: 'Contenedor' },
        { value: 'Enlonada', label: 'Enlonada' }
      ],
      accessor: (item) => item.tipoCarga
    },
    {
      key: 'matricula',
      header: 'Matrícula',
      sortable: true,
      filterable: true,
      accessor: (item) => <span className="font-medium">{item.matricula}</span>
    },
    {
      key: 'origen',
      header: 'Origen',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'Montevideo', label: 'Montevideo' },
        { value: 'Nueva Palmira', label: 'Nueva Palmira' },
        { value: 'Colonia', label: 'Colonia' },
        { value: 'Fray Bentos', label: 'Fray Bentos' },
        { value: 'Paysandú', label: 'Paysandú' },
        { value: 'Salto', label: 'Salto' },
        { value: 'Rivera', label: 'Rivera' },
        { value: 'Chuy', label: 'Chuy' },
        { value: 'Río Branco', label: 'Río Branco' },
        { value: 'Artigas', label: 'Artigas' },
        { value: 'Bella Unión', label: 'Bella Unión' },
        { value: 'Aceguá', label: 'Aceguá' }
      ],
      accessor: (item) => item.origen
    },
    {
      key: 'destino',
      header: 'Destino',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'Montevideo', label: 'Montevideo' },
        { value: 'Nueva Palmira', label: 'Nueva Palmira' },
        { value: 'Colonia', label: 'Colonia' },
        { value: 'Fray Bentos', label: 'Fray Bentos' },
        { value: 'Paysandú', label: 'Paysandú' },
        { value: 'Salto', label: 'Salto' },
        { value: 'Rivera', label: 'Rivera' },
        { value: 'Chuy', label: 'Chuy' },
        { value: 'Río Branco', label: 'Río Branco' },
        { value: 'Artigas', label: 'Artigas' },
        { value: 'Bella Unión', label: 'Bella Unión' },
        { value: 'Aceguá', label: 'Aceguá' }
      ],
      accessor: (item) => item.destino
    },
    {
      key: 'despachante',
      header: 'Despachante',
      sortable: true,
      filterable: true,
      accessor: (item) => (
        <div className="max-w-xs truncate" title={item.despachante}>
          {item.despachante}
        </div>
      )
    },
    {
      key: 'fechaIngreso',
      header: 'Tiempo Pendiente',
      sortable: true,
      accessor: (item) => (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-gray-500" />
          <span className={cn(
            "text-sm font-medium",
            getTiempoColor(item.fechaIngreso)
          )}>
            {formatTimeAgo(item.fechaIngreso)}
          </span>
        </div>
      )
    }
  ];

  const handleExport = (data: TransitoPendiente[], format: 'csv' | 'json') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `transitos-pendientes-${timestamp}`;
    
    if (format === 'csv') {
      const headers = ['N° Viaje', 'MOV', 'DUA', 'Tipo de Carga', 'Matrícula', 'Origen', 'Destino', 'Despachante', 'Fecha Ingreso'];
      const rows = data.map(t => [
        t.numeroViaje,
        t.mov,
        t.dua,
        t.tipoCarga,
        t.matricula,
        t.origen,
        t.destino,
        t.despachante,
        new Date(t.fechaIngreso * 1000).toLocaleString('es-UY')
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

  return (
    <DataTable
      data={transitos}
      columns={columns}
      searchKeys={['numeroViaje', 'dua', 'matricula', 'despachante']}
      searchPlaceholder="Buscar por viaje, DUA, matrícula o despachante..."
      title="Tránsitos Pendientes en LUCIA"
      onExport={handleExport}
      emptyMessage="No hay tránsitos pendientes"
      defaultItemsPerPage={25}
      itemsPerPageOptions={[10, 25, 50, 100]}
    />
  );
};