import React from 'react';
import { 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  User,
  MapPin,
  Package,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { CountdownTimer } from './CountdownTimer';
import type { TransitoTorreControl, EstadoSemaforo } from '../types';

interface TransitoRowProps {
  transito: TransitoTorreControl;
  index: number;
  onClick: () => void;
}

export const TransitoRow: React.FC<TransitoRowProps> = ({ transito, index, onClick }) => {
  const getSemaforoIcon = (semaforo: EstadoSemaforo) => {
    switch (semaforo) {
      case 'verde':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'amarillo':
        return <AlertTriangle className="h-6 w-6 text-yellow-500 animate-pulse" />;
      case 'rojo':
        return <XCircle className="h-6 w-6 text-red-500 animate-pulse" />;
    }
  };

  const getRowAnimation = () => {
    if (transito.semaforo === 'rojo') {
      return 'animate-pulse-slow';
    }
    if (transito.alertas && transito.alertas.length > 0) {
      return 'animate-attention';
    }
    return '';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-UY', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isPastDeparture = transito.fechaSalida.getTime() > Date.now();

  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-all duration-200",
        getRowAnimation(),
        index % 2 === 0 ? "bg-gray-900/30" : "bg-gray-900/50"
      )}
    >
      {/* Hora Salida */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            "h-4 w-4",
            isPastDeparture ? "text-blue-400" : "text-gray-400"
          )} />
          <span className={cn(
            "font-mono text-lg",
            isPastDeparture ? "text-blue-400" : "text-white"
          )}>
            {formatTime(transito.fechaSalida)}
          </span>
        </div>
      </td>

      {/* Camión */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-white font-medium text-lg">{transito.matricula}</p>
            <p className="text-gray-400 text-sm">{transito.pvid}</p>
          </div>
        </div>
      </td>

      {/* Chofer */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-gray-300 text-base">{transito.chofer}</p>
            <p className="text-gray-500 text-sm">{transito.choferCI}</p>
          </div>
        </div>
      </td>

      {/* Origen */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300 text-base">{transito.origen}</span>
        </div>
      </td>

      {/* Destino */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300 text-base">{transito.destino}</span>
        </div>
      </td>

      {/* ETA */}
      <td className="px-4 py-4">
        <div className="text-center">
          <CountdownTimer targetTime={transito.eta} />
          <p className="text-gray-500 text-sm mt-1">
            {transito.eta.toLocaleTimeString('es-UY', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </td>

      {/* Estado */}
      <td className="px-4 py-4">
        <div className="flex justify-center">
          {getSemaforoIcon(transito.semaforo)}
        </div>
      </td>

      {/* Observaciones */}
      <td className="px-4 py-4 max-w-xs">
        <div className="space-y-1">
          <p className="text-gray-300 text-sm truncate">{transito.observaciones}</p>
          {transito.alertas && transito.alertas.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-xs">
                {transito.alertas.length} alerta{transito.alertas.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Acción */}
      <td className="px-4 py-4 text-center">
        <ChevronRight className="h-5 w-5 text-gray-400 mx-auto" />
      </td>
    </tr>
  );
};