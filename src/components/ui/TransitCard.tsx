import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/utils';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { InfoRow } from './InfoRow';
import { 
  Clock, 
  User, 
  Package, 
  History,
  TruckIcon,
  Link2,
  AlertTriangle
} from 'lucide-react';

export interface TransitInfo {
  id: string;
  origin: string;
  destination: string;
  status: 'in-transit' | 'arrived' | 'delayed' | 'stopped' | 'completed';
  progress?: number;
  startTime: Date | string;
  estimatedArrival?: Date | string;
  actualArrival?: Date | string;
  vehicle?: {
    type: string;
    plate: string;
    driver?: string;
    frequentDriver?: string; // Chofer más frecuente
  };
  cargo?: {
    description: string;
    weight?: number;
    units?: number;
    precinto?: string; // Número de precinto
    eslingas?: number; // Cantidad de eslingas
  };
  metadata?: Record<string, any>;
}

interface TransitCardProps {
  transit: TransitInfo;
  className?: string;
  onClick?: (transit: TransitInfo) => void;
  onViewHistory?: (vehiclePlate: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
}

export const TransitCard: React.FC<TransitCardProps> = ({
  transit,
  className,
  onClick,
  onViewHistory,
  variant = 'default',
  showProgress = true
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    const updateTimeRemaining = () => {
      setTimeRemaining(calculateTimeRemaining());
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [transit.estimatedArrival, transit.status]);

  const getStatusVariant = (status: TransitInfo['status']): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    const variants = {
      'in-transit': 'info' as const,
      'arrived': 'success' as const,
      'delayed': 'warning' as const,
      'stopped': 'danger' as const,
      'completed': 'default' as const
    };
    return variants[status];
  };

  const getStatusText = (status: TransitInfo['status']) => {
    const texts = {
      'in-transit': 'En Tránsito',
      'arrived': 'Arribado',
      'delayed': 'Demorado',
      'stopped': 'Detenido',
      'completed': 'Completado'
    };
    return texts[status];
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTimeRemaining = () => {
    if (!transit.estimatedArrival || transit.status === 'arrived' || transit.status === 'completed') {
      return null;
    }
    
    const now = new Date();
    const arrival = transit.estimatedArrival instanceof Date 
      ? transit.estimatedArrival 
      : new Date(transit.estimatedArrival);
    
    const diff = arrival.getTime() - now.getTime();
    if (diff < 0) return 'Demorado';
    
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const getTrafficLightStatus = () => {
    if (transit.status === 'stopped' || transit.status === 'delayed') return 'danger';
    if (transit.status === 'arrived' || transit.status === 'completed') return 'success';
    return 'warning';
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        onClick && 'hover:border-blue-500',
        className
      )}
      onClick={() => onClick?.(transit)}
      variant="elevated"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-100 mb-1">
            {transit.origin} → {transit.destination}
          </h3>
          <p className="text-sm text-gray-400">ID: {transit.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Traffic Light Status */}
          <StatusBadge
            variant={getTrafficLightStatus()}
            size="sm"
            className="!rounded-full !px-0 !py-0 !w-3 !h-3"
          />
          <StatusBadge
            variant={getStatusVariant(transit.status)}
            size="md"
          >
            {getStatusText(transit.status)}
          </StatusBadge>
        </div>
      </div>

      {/* ETA with countdown */}
      {transit.estimatedArrival && timeRemaining && (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">ETA</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-white">{timeRemaining}</p>
              <p className="text-xs text-gray-400">{formatDate(transit.estimatedArrival)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && transit.progress !== undefined && variant !== 'compact' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progreso</span>
            <span>{transit.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                transit.status === 'delayed' ? 'bg-yellow-500' :
                transit.status === 'stopped' ? 'bg-red-500' :
                'bg-blue-500'
              )}
              style={{ width: `${transit.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Info Rows */}
      <div className="space-y-2">
        <InfoRow label="Inicio" value={formatDate(transit.startTime)} />
        
        {transit.actualArrival && (
          <InfoRow 
            label="Llegada Real" 
            value={formatDate(transit.actualArrival)}
            variant="highlight"
          />
        )}

        {/* Vehicle Information */}
        {transit.vehicle && (
          <>
            <InfoRow 
              label="Vehículo" 
              value={`${transit.vehicle.type} - ${transit.vehicle.plate}`}
              icon={<TruckIcon className="h-4 w-4" />}
            />
            {transit.vehicle.driver && (
              <InfoRow 
                label="Conductor Actual" 
                value={transit.vehicle.driver}
                icon={<User className="h-4 w-4" />}
              />
            )}
            {transit.vehicle.frequentDriver && transit.vehicle.frequentDriver !== transit.vehicle.driver && (
              <InfoRow 
                label="Chofer Frecuente" 
                value={transit.vehicle.frequentDriver}
                icon={<User className="h-4 w-4 text-gray-400" />}
                variant="muted"
              />
            )}
          </>
        )}
        
        {/* Cargo Information */}
        {transit.cargo && (
          <>
            <InfoRow 
              label="Carga" 
              value={transit.cargo.description}
              icon={<Package className="h-4 w-4" />}
            />
            {transit.cargo.weight && (
              <InfoRow label="Peso" value={`${transit.cargo.weight} kg`} />
            )}
            
            {/* Precinto y Eslingas */}
            <div className="flex gap-4 mt-2">
              {transit.cargo.precinto && (
                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  <Link2 className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Precinto</p>
                    <p className="text-sm font-medium text-white">{transit.cargo.precinto}</p>
                  </div>
                </div>
              )}
              {transit.cargo.eslingas !== undefined && (
                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  <Package className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Eslingas</p>
                    <p className="text-sm font-medium text-white">{transit.cargo.eslingas}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Alert for delayed transits */}
        {transit.status === 'delayed' && (
          <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-400">Tránsito demorado</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {variant !== 'compact' && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
          <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Ver Ruta
          </button>
          
          {transit.vehicle?.plate && (
            <button 
              className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewHistory?.(transit.vehicle!.plate);
              }}
            >
              <History className="h-4 w-4" />
              Ver historial del camión
            </button>
          )}
        </div>
      )}
    </Card>
  );
};