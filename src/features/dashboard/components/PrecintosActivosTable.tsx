import React, { useState, useMemo, useCallback, memo } from 'react';
import { Link2, Battery, MapPin, AlertTriangle, ChevronUp, ChevronDown, Network, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils/utils';
import { PrecintoCommandsModal } from './PrecintoCommandsModal';
import { TransitoDetailModal } from './TransitoDetailModal';
import type { PrecintoActivo as PrecintoActivoType } from '../../../types/monitoring';

interface PrecintoActivo {
  id: string;
  nserie: string;
  nqr: string;
  estado: 'armado' | 'alarma';
  bateria?: number;
  destino?: string;
  viaje?: string;
  movimiento?: string;
  ultimoReporte?: string;
  transitoId?: string;
}

interface PrecintosActivosTableProps {
  precintos?: PrecintoActivo[];
}

export const PrecintosActivosTable: React.FC<PrecintosActivosTableProps> = memo(({ precintos = [] }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedPrecinto, setSelectedPrecinto] = useState<PrecintoActivoType | null>(null);
  const [showCommandsModal, setShowCommandsModal] = useState(false);
  const [selectedTransitoId, setSelectedTransitoId] = useState<string | null>(null);
  const [showTransitoModal, setShowTransitoModal] = useState(false);

  // Lista de depósitos
  const depositos = [
    'Rilcomar',
    'Taminer',
    'Briasol',
    'Murchison',
    'Rincorando',
    'TCU',
    'Montecon',
    'TCP',
    'Zonamerica',
    'Puerto Nueva Palmira'
  ];

  // Map the incoming precintos to the expected format
  const mappedPrecintos: PrecintoActivo[] = precintos.map((p: any) => ({
    id: p.id,
    nserie: p.codigo || p.nserie || `BT${p.id}`,
    nqr: p.numeroPrecinto?.toString() || p.nqr || Math.floor(Math.random() * 1000 + 1).toString(),
    estado: p.estado === 'SAL' || p.estado === 'armado' ? 'armado' : 
            p.estado === 'CNP' || p.estado === 'alarma' ? 'alarma' : 'armado',
    bateria: p.bateria,
    destino: p.ubicacion?.direccion || p.ubicacion || p.destino || depositos[Math.floor(Math.random() * depositos.length)],
    viaje: p.viaje || `MVD-${['BA', 'SP', 'RJ', 'ASU'][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
    movimiento: p.mov ? `Mov ${p.mov}` : ['Exportación', 'Importación', 'Tránsito'][Math.floor(Math.random() * 3)],
    ultimoReporte: p.ultimoReporte || 'Hace 5 min',
    transitoId: p.asignadoTransito || p.transitoId
  }));
  
  // Generate mock data if no precintos provided
  const mockPrecintos: PrecintoActivo[] = mappedPrecintos.length > 0 ? mappedPrecintos : [
    {
      id: '1',
      nserie: 'BT123456',
      nqr: '234',
      estado: 'armado',
      bateria: 85,
      destino: 'Montecon',
      viaje: 'MVD-BA-001',
      movimiento: 'Exportación',
      ultimoReporte: '5 minutos',
      transitoId: 'TR-00001'
    },
    {
      id: '2',
      nserie: 'BT123457',
      nqr: '567',
      estado: 'alarma',
      bateria: 45,
      destino: 'TCP',
      viaje: 'MVD-SP-015',
      movimiento: 'Importación',
      ultimoReporte: '2 horas',
      transitoId: 'TR-00002'
    },
    {
      id: '3',
      nserie: 'BT123458',
      nqr: '89',
      estado: 'armado',
      bateria: 92,
      destino: 'Zonamerica',
      viaje: 'MVD-RJ-023',
      movimiento: 'Tránsito',
      ultimoReporte: '15 minutos',
      transitoId: 'TR-00003'
    },
    {
      id: '4',
      nserie: 'BT123459',
      nqr: '456',
      estado: 'armado',
      bateria: 15,
      destino: 'Rilcomar',
      viaje: 'MVD-ASU-007',
      movimiento: 'Exportación',
      ultimoReporte: '1 hora',
      transitoId: 'TR-00004'
    },
    {
      id: '5',
      nserie: 'BT123460',
      nqr: '789',
      estado: 'alarma',
      bateria: 70,
      destino: 'Briasol',
      viaje: 'MVD-BA-009',
      movimiento: 'Importación',
      ultimoReporte: '30 minutos',
      transitoId: 'TR-00005'
    }
  ];

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-500';
    if (level >= 60) return 'text-green-500';
    if (level >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Función para manejar el ordenamiento
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  // Datos ordenados
  const sortedPrecintos = useMemo(() => {
    const dataToSort = mappedPrecintos.length > 0 ? mappedPrecintos : mockPrecintos;
    
    if (!sortColumn) return dataToSort;

    return [...dataToSort].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof PrecintoActivo];
      let bValue: any = b[sortColumn as keyof PrecintoActivo];

      // Manejo especial para columnas numéricas
      if (sortColumn === 'nqr' || sortColumn === 'bateria') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      // Manejo especial para tiempo de reporte
      if (sortColumn === 'ultimoReporte') {
        // Convertir a minutos para ordenar
        const parseTime = (time: string) => {
          if (time.includes('minuto')) return parseInt(time) || 1;
          if (time.includes('hora')) return (parseInt(time) || 1) * 60;
          return 0;
        };
        aValue = parseTime(aValue);
        bValue = parseTime(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [mappedPrecintos, mockPrecintos, sortColumn, sortDirection]);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg sm:text-xl font-semibold text-white">Precintos Activos</h3>
        <Link 
          to="/precintos" 
          className="text-sm sm:text-base text-blue-400 hover:text-blue-300 whitespace-nowrap"
        >
          Ver todos →
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort('nqr')}
              >
                <div className="flex items-center gap-1">
                  Precinto
                  {sortColumn === 'nqr' && (
                    <span className="text-blue-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort('viaje')}
              >
                <div className="flex items-center gap-1">
                  Viaje / Movimiento
                  {sortColumn === 'viaje' && (
                    <span className="text-blue-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort('estado')}
              >
                <div className="flex items-center gap-1">
                  Estado
                  {sortColumn === 'estado' && (
                    <span className="text-blue-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort('bateria')}
              >
                <div className="flex items-center gap-1">
                  Batería
                  {sortColumn === 'bateria' && (
                    <span className="text-blue-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort('destino')}
              >
                <div className="flex items-center gap-1">
                  Destino
                  {sortColumn === 'destino' && (
                    <span className="text-blue-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                onClick={() => handleSort('ultimoReporte')}
              >
                <div className="flex items-center gap-1">
                  Último Reporte
                  {sortColumn === 'ultimoReporte' && (
                    <span className="text-blue-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedPrecintos.map((precinto) => (
              <tr key={precinto.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-white">
                      {precinto.nqr}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPrecinto(precinto as PrecintoActivoType);
                        setShowCommandsModal(true);
                      }}
                      className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all hover:scale-110"
                      title="Enviar comandos al precinto"
                    >
                      <Network className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-base font-medium text-blue-400">{precinto.viaje}</div>
                    <div className="text-sm text-gray-400">{precinto.movimiento}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium",
                    precinto.estado === 'armado' 
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-red-500/20 text-red-400"
                  )}>
                    {precinto.estado === 'armado' ? (
                      <Link2 className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 animate-pulse" />
                    )}
                    {precinto.estado === 'armado' ? 'Armado' : 'Alarma'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {precinto.bateria && (
                    <div className="flex items-center gap-1">
                      <Battery className={cn("h-4 w-4", getBatteryColor(precinto.bateria))} />
                      <span className={cn("text-base", getBatteryColor(precinto.bateria))}>
                        {precinto.bateria}%
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-base text-gray-300">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {precinto.destino}
                  </div>
                </td>
                <td className="px-4 py-3 text-base text-gray-400">
                  {precinto.ultimoReporte}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {precinto.transitoId && (
                      <button
                        onClick={() => {
                          setSelectedTransitoId(precinto.transitoId!);
                          setShowTransitoModal(true);
                        }}
                        className="p-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded transition-all hover:scale-110"
                        title="Ver detalles del tránsito"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {mockPrecintos.length === 0 && (
        <div className="px-6 py-8 text-center">
          <p className="text-lg text-gray-400">No hay precintos activos en este momento</p>
        </div>
      )}
      
      {/* Commands Modal */}
      {selectedPrecinto && (
        <PrecintoCommandsModal
          precinto={selectedPrecinto}
          isOpen={showCommandsModal}
          onClose={() => {
            setShowCommandsModal(false);
            setSelectedPrecinto(null);
          }}
        />
      )}
      
      {/* Transito Detail Modal */}
      {selectedTransitoId && (
        <TransitoDetailModal
          transitoId={selectedTransitoId}
          isOpen={showTransitoModal}
          onClose={() => {
            setShowTransitoModal(false);
            setSelectedTransitoId(null);
          }}
        />
      )}
    </div>
  );
});

PrecintosActivosTable.displayName = 'PrecintosActivosTable';