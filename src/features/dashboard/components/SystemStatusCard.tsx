import React from 'react';
import { MessageSquare, Database, Server, FileText } from 'lucide-react';
import { cn } from '../../../utils/utils';

interface SystemStatusCardProps {
  smsPendientes: number;
  dbStats: {
    memoriaUsada: number;
    discoUsado: number;
  };
  apiStats: {
    memoriaUsada: number;
    discoUsado: number;
  };
  reportesPendientes: number;
}

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  smsPendientes,
  dbStats,
  apiStats,
  reportesPendientes
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Estado del Sistema</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-gray-600" />
          <div>
            <p className="text-sm sm:text-base text-gray-400">SMS Pendientes</p>
            <p className={cn(
              "text-2xl sm:text-3xl font-semibold",
              smsPendientes > 0 ? "text-red-500" : "text-white"
            )}>
              {smsPendientes}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Database className={cn(
            "h-8 w-8",
            dbStats.memoriaUsada > 80 || dbStats.discoUsado > 80 ? "text-yellow-500" : "text-gray-600"
          )} />
          <div>
            <p className="text-sm sm:text-base text-gray-400">Base de Datos</p>
            <p className="text-lg sm:text-xl font-semibold text-white">
              {Math.round(dbStats.memoriaUsada)}% MEM
            </p>
            <p className="text-sm sm:text-base text-gray-500">
              {Math.round(dbStats.discoUsado)}% HDD
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Server className={cn(
            "h-8 w-8",
            apiStats.memoriaUsada > 80 || apiStats.discoUsado > 80 ? "text-yellow-500" : "text-gray-600"
          )} />
          <div>
            <p className="text-sm sm:text-base text-gray-400">Servidor API</p>
            <p className="text-lg sm:text-xl font-semibold text-white">
              {Math.round(apiStats.memoriaUsada)}% MEM
            </p>
            <p className="text-sm sm:text-base text-gray-500">
              {Math.round(apiStats.discoUsado)}% HDD
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-gray-600" />
          <div>
            <p className="text-sm sm:text-base text-gray-400">Reportes Pendientes</p>
            <p className="text-2xl sm:text-3xl font-semibold text-white">
              {reportesPendientes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};