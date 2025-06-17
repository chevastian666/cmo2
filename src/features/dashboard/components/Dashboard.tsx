/**
 * Dashboard Principal del Sistema CMO
 * By Cheva
 */

import React, { memo } from 'react';
import { SystemStatusCard } from './SystemStatusCard';
import { PrecintosActivosTable } from './PrecintosActivosTable';
import { TransitosPendientesTable } from '../../transitos';
import { AlertsList } from '../../alertas';
import { RealtimeIndicator } from './RealtimeIndicator';
import { KPICards } from './KPICards';
import { NotificationSettings } from '../../../components/ui/NotificationSettings';
import { 
  usePrecintosActivos, 
  useTransitosPendientes, 
  useAlertasActivas, 
  useSystemStatus 
} from '../../../store/hooks';

export const Dashboard: React.FC = memo(() => {
  const { precintos } = usePrecintosActivos();
  const { estadisticas, smsPendientes, dbStats, apiStats, reportesPendientes } = useSystemStatus();
  const { alertas } = useAlertasActivas();
  const { transitos } = useTransitosPendientes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Panel de Control</h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base lg:text-lg">Sistema de Monitoreo de Precintos Electrónicos - Block Tracker</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationSettings compact />
          <RealtimeIndicator />
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards transitos={transitos} alertas={alertas} />

      <SystemStatusCard
        smsPendientes={smsPendientes}
        dbStats={dbStats}
        apiStats={apiStats}
        reportesPendientes={reportesPendientes}
      />

      <div className="">
        <TransitosPendientesTable transitos={transitos} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PrecintosActivosTable precintos={precintos} />
        </div>
        <div>
          <AlertsList />
        </div>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';