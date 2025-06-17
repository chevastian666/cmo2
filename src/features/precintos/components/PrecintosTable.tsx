import React from 'react';
import { formatTime24h } from '../../../utils/formatters';
import type { Precinto } from '../../../types/monitoring';
import { Battery, MapPin, Radio, Lock, LockOpen, ShieldAlert } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { DataTable, type Column } from '../../../components/DataTable';

interface PrecintosTableProps {
  precintos: Precinto[];
}

export const PrecintosTable: React.FC<PrecintosTableProps> = ({ precintos }) => {
  const getEstadoColor = (estado: Precinto['estado']) => {
    switch (estado) {
      case 'SAL':
        return 'text-blue-400 bg-blue-900/20';
      case 'LLE':
        return 'text-green-400 bg-green-900/20';
      case 'FMF':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'CFM':
        return 'text-purple-400 bg-purple-900/20';
      case 'CNP':
        return 'text-red-400 bg-red-900/20';
    }
  };

  const columns: Column<Precinto>[] = [
    {
      key: 'numeroPrecinto',
      header: 'Precinto / Batería',
      sortable: true,
      filterable: true,
      filterType: 'number',
      accessor: (item) => (
        <div className="flex items-center space-x-3">
          <span className="font-medium text-white">{item.numeroPrecinto}</span>
          <div className="flex items-center">
            <Battery className={cn(
              "h-4 w-4 mr-1",
              item.bateria < 20 ? "text-red-400" : 
              item.bateria < 50 ? "text-yellow-400" : "text-green-400"
            )} />
            <span className="text-sm text-gray-300">{item.bateria}%</span>
          </div>
        </div>
      )
    },
    {
      key: 'numeroViaje',
      header: 'Viaje / MOV',
      sortable: true,
      filterable: true,
      accessor: (item) => (
        <div>
          <span className="font-medium text-white">{item.numeroViaje}</span>
          <span className="text-cyan-400 ml-2">/ {item.mov}</span>
        </div>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'SAL', label: 'SAL - Salida' },
        { value: 'LLE', label: 'LLE - Llegada' },
        { value: 'FMF', label: 'FMF - Finalización Manual Forzada' },
        { value: 'CFM', label: 'CFM - Confirmado' },
        { value: 'CNP', label: 'CNP - Cancelado No Precintado' }
      ],
      accessor: (item) => (
        <span className={cn(
          "inline-flex px-2 py-1 text-xs font-medium rounded-full",
          getEstadoColor(item.estado)
        )}>
          {item.estado}
        </span>
      )
    },
    {
      key: 'ubicacionActual',
      header: 'Ubicación',
      sortable: false,
      filterable: true,
      accessor: (item) => (
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          {item.ubicacionActual.direccion || 
           `${item.ubicacionActual.lat.toFixed(4)}, ${item.ubicacionActual.lng.toFixed(4)}`}
        </div>
      )
    },
    {
      key: 'sensores',
      header: 'Sensores',
      sortable: false,
      accessor: (item) => (
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center">
            <Radio className={cn(
              "h-4 w-4 mr-1",
              item.gps.activo ? "text-green-400" : "text-red-400"
            )} />
            <span className={cn(
              item.gps.activo ? "text-green-400" : "text-red-400"
            )}>
              {item.gps.activo ? 'SI' : 'NO'}
            </span>
          </div>
          <div className="flex items-center">
            {item.eslinga.estado === 'cerrada' && (
              <>
                <Lock className="h-4 w-4 mr-1 text-green-400" />
                <span className="text-green-400">Cerrada</span>
              </>
            )}
            {item.eslinga.estado === 'abierta' && (
              <>
                <LockOpen className="h-4 w-4 mr-1 text-yellow-400" />
                <span className="text-yellow-400">Abierta</span>
              </>
            )}
            {item.eslinga.estado === 'violada' && (
              <>
                <ShieldAlert className="h-4 w-4 mr-1 text-red-400" />
                <span className="text-red-400">Violada</span>
              </>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'fechaUltimaLectura',
      header: 'Última Lectura',
      sortable: true,
      accessor: (item) => formatTime24h(item.fechaUltimaLectura)
    }
  ];

  const handleExport = (data: Precinto[], format: 'csv' | 'json') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `precintos-activos-${timestamp}`;
    
    if (format === 'csv') {
      const headers = ['Precinto', 'Viaje', 'MOV', 'Estado', 'Ubicación', 'GPS', 'Eslinga', 'Batería', 'Última Lectura'];
      const rows = data.map(p => [
        p.numeroPrecinto,
        p.numeroViaje,
        p.mov,
        p.estado,
        p.ubicacionActual.direccion || `${p.ubicacionActual.lat.toFixed(4)}, ${p.ubicacionActual.lng.toFixed(4)}`,
        p.gps.activo ? 'SI' : 'NO',
        p.eslinga.estado,
        `${p.bateria}%`,
        new Date(p.fechaUltimaLectura * 1000).toLocaleString('es-UY')
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
      data={precintos}
      columns={columns}
      searchKeys={['codigo', 'numeroViaje']}
      searchPlaceholder="Buscar por código o viaje..."
      title="Precintos Activos"
      onExport={handleExport}
      emptyMessage="No hay precintos activos"
      defaultItemsPerPage={25}
      itemsPerPageOptions={[10, 25, 50, 100]}
    />
  );
};