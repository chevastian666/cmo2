import React, { useState } from 'react';
import { AlertTriangle, Shield, TrendingUp, Clock, Users, CheckCircle, History } from 'lucide-react';
import { AlertsTable } from '../components/AlertsTable';
import { HistorialAlertasCriticasModal } from '../components/HistorialAlertasCriticasModal';
import { useAlertasStore } from '../../../store';

export const AlertasPage: React.FC = () => {
  const alertas = useAlertasStore(state => state.alertas);
  const alertasActivas = useAlertasStore(state => state.alertasActivas);
  const [showHistorialModal, setShowHistorialModal] = useState(false);

  // Calculate statistics
  const stats = {
    total: alertas.length,
    activas: alertasActivas.length,
    atendidas: alertas.filter(a => a.atendida).length,
    criticas: alertasActivas.filter(a => a.severidad === 'critica').length,
    altas: alertasActivas.filter(a => a.severidad === 'alta').length,
    medias: alertasActivas.filter(a => a.severidad === 'media').length,
    bajas: alertasActivas.filter(a => a.severidad === 'baja').length,
    porTipo: {
      violacion: alertasActivas.filter(a => a.tipo === 'violacion').length,
      bateria_baja: alertasActivas.filter(a => a.tipo === 'bateria_baja').length,
      fuera_de_ruta: alertasActivas.filter(a => a.tipo === 'fuera_de_ruta').length,
      temperatura: alertasActivas.filter(a => a.tipo === 'temperatura').length,
      sin_signal: alertasActivas.filter(a => a.tipo === 'sin_signal').length,
      intrusion: alertasActivas.filter(a => a.tipo === 'intrusion').length,
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Gestión de Alarmas</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Monitoreo y gestión centralizada de todas las alarmas del sistema
          </p>
        </div>
        <button
          onClick={() => setShowHistorialModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <History className="h-5 w-5" />
          <span>Historial de Críticas</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Alarmas</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Historial completo</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Activas</p>
              <p className="text-2xl font-semibold text-red-400 mt-1">{stats.activas}</p>
              <div className="flex space-x-2 mt-1">
                <span className="text-xs text-red-400">{stats.criticas} críticas</span>
                <span className="text-xs text-orange-400">{stats.altas} altas</span>
              </div>
            </div>
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Atendidas</p>
              <p className="text-2xl font-semibold text-green-400 mt-1">{stats.atendidas}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? Math.round((stats.atendidas / stats.total) * 100) : 0}% resueltas
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tipos más frecuentes</p>
              <div className="mt-2 space-y-1">
                {Object.entries(stats.porTipo)
                  .filter(([_, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([tipo, count]) => (
                    <div key={tipo} className="flex justify-between text-xs">
                      <span className="text-gray-300 capitalize">{tipo.replace('_', ' ')}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>


      {/* Alerts Table */}
      <AlertsTable />

      {/* Historial Modal */}
      <HistorialAlertasCriticasModal
        isOpen={showHistorialModal}
        onClose={() => setShowHistorialModal(false)}
      />
    </div>
  );
};