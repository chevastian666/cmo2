import React from 'react';
import { Truck} from 'lucide-react';
import { TransitosPendientesTable} from './TransitosPendientesTable';
import type { TransitoPendiente} from '../../../types/monitoring';

interface TransitosPendientesWrapperProps {
  transitos: TransitoPendiente[];
}

export const TransitosPendientesWrapper: React.FC<TransitosPendientesWrapperProps> = ({ transitos }) => {
  return (
    <div className="bg-gray-800 rounded-lg border-2 border-yellow-600/50 shadow-lg shadow-yellow-600/10">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <Truck className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">TRÁNSITOS PENDIENTES EN LUCIA</h2>
              <p className="text-sm text-yellow-400 mt-0.5">Requieren atención inmediata para precintar</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-yellow-400 bg-yellow-900/30 px-3 py-1 rounded-lg">
            {transitos.length} pendientes
          </span>
        </div>
      </div>
      <div className="p-4">
        <TransitosPendientesTable transitos={transitos} />
      </div>
    </div>
  );
};