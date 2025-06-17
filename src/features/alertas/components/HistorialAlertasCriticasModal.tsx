/**
 * Modal de Historial de Alertas Críticas
 * By Cheva
 */

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, User, MessageSquare, CheckCircle, Search, Calendar } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { formatDateTime, formatTimeAgo } from '../../../utils/formatters';
import type { Alerta } from '../../../types';
import { useAlertasStore } from '../../../store';

interface HistorialAlertasCriticasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlertaCriticaHistorial extends Alerta {
  respuesta?: {
    tipo: string;
    descripcion: string;
    usuario: string;
    timestamp: number;
    acciones?: string[];
  };
  asignacion?: {
    usuario: string;
    timestamp: number;
    notas?: string;
  };
  comentarios?: Array<{
    id: string;
    usuario: string;
    mensaje: string;
    timestamp: number;
  }>;
}

export const HistorialAlertasCriticasModal: React.FC<HistorialAlertasCriticasModalProps> = ({
  isOpen,
  onClose
}) => {
  const [alertasCriticas, setAlertasCriticas] = useState<AlertaCriticaHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaCriticaHistorial | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAlertasCriticas();
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const fetchAlertasCriticas = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, generate mock data
      const mockData: AlertaCriticaHistorial[] = generateMockAlertasCriticas();
      setAlertasCriticas(mockData);
    } catch (error) {
      console.error('Error fetching critical alerts history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = (alerts: AlertaCriticaHistorial[]) => {
    let filtered = alerts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.codigoPrecinto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.respuesta?.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    const now = Date.now() / 1000;
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(alert => now - alert.timestamp < 86400);
        break;
      case 'week':
        filtered = filtered.filter(alert => now - alert.timestamp < 604800);
        break;
      case 'month':
        filtered = filtered.filter(alert => now - alert.timestamp < 2592000);
        break;
    }

    return filtered;
  };

  const filteredAlerts = filterAlerts(alertasCriticas);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-900/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Historial de Alertas Críticas
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Registro completo de alertas críticas y sus respuestas
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-gray-850 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por precinto, mensaje o respuesta..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateFilter('all')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    dateFilter === 'all'
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  Todas
                </button>
                <button
                  onClick={() => setDateFilter('today')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    dateFilter === 'today'
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setDateFilter('week')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    dateFilter === 'week'
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  Semana
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    dateFilter === 'month'
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  Mes
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No se encontraron alertas críticas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors cursor-pointer"
                    onClick={() => setSelectedAlerta(alerta)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-blue-400">
                            {alerta.codigoPrecinto}
                          </span>
                          <span className={cn(
                            "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                            alerta.atendida 
                              ? "bg-green-900/20 text-green-400"
                              : "bg-red-900/20 text-red-400"
                          )}>
                            {alerta.atendida ? 'Resuelta' : 'Activa'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDateTime(alerta.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-2">{alerta.mensaje}</p>
                        
                        {alerta.respuesta && (
                          <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-sm font-medium text-green-400">
                                Respuesta: {alerta.respuesta.tipo}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 ml-6">
                              {alerta.respuesta.descripcion}
                            </p>
                            <div className="flex items-center gap-2 mt-2 ml-6 text-xs text-gray-500">
                              <User className="h-3 w-3" />
                              <span>{alerta.respuesta.usuario}</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(alerta.respuesta.timestamp)}</span>
                            </div>
                            {alerta.respuesta.acciones && alerta.respuesta.acciones.length > 0 && (
                              <div className="mt-2 ml-6">
                                <p className="text-xs text-gray-500 mb-1">Acciones tomadas:</p>
                                <ul className="list-disc list-inside text-xs text-gray-400">
                                  {alerta.respuesta.acciones.map((accion, index) => (
                                    <li key={index}>{accion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {alerta.comentarios && alerta.comentarios.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3" />
                            <span>{alerta.comentarios.length} comentarios</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="px-6 py-4 bg-gray-850 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-400">
                  {alertasCriticas.filter(a => !a.atendida).length}
                </p>
                <p className="text-sm text-gray-400">Activas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {alertasCriticas.filter(a => a.atendida).length}
                </p>
                <p className="text-sm text-gray-400">Resueltas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {alertasCriticas.length}
                </p>
                <p className="text-sm text-gray-400">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAlerta && (
        <AlertaDetailModal
          alerta={selectedAlerta}
          onClose={() => setSelectedAlerta(null)}
        />
      )}
    </div>
  );
};

// Detail modal for selected alert
const AlertaDetailModal: React.FC<{
  alerta: AlertaCriticaHistorial;
  onClose: () => void;
}> = ({ alerta, onClose }) => {
  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Detalle de Alerta Crítica
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="px-6 py-4 max-h-[500px] overflow-y-auto">
            {/* Alert details */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Información de la Alerta</h4>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Precinto</p>
                    <p className="text-sm font-medium text-white">{alerta.codigoPrecinto}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Fecha/Hora</p>
                    <p className="text-sm font-medium text-white">
                      {formatDateTime(alerta.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-400">Mensaje</p>
                  <p className="text-sm text-white mt-1">{alerta.mensaje}</p>
                </div>
              </div>
            </div>

            {/* Assignment */}
            {alerta.asignacion && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Asignación</h4>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-white">{alerta.asignacion.usuario}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(alerta.asignacion.timestamp)}
                    </span>
                  </div>
                  {alerta.asignacion.notas && (
                    <p className="text-sm text-gray-300 mt-2 ml-6">
                      {alerta.asignacion.notas}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Response */}
            {alerta.respuesta && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Respuesta</h4>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="mb-3">
                    <p className="text-xs text-gray-400">Tipo de Resolución</p>
                    <p className="text-sm font-medium text-white">{alerta.respuesta.tipo}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-400">Descripción</p>
                    <p className="text-sm text-white">{alerta.respuesta.descripcion}</p>
                  </div>
                  {alerta.respuesta.acciones && alerta.respuesta.acciones.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400">Acciones Tomadas</p>
                      <ul className="list-disc list-inside text-sm text-white mt-1">
                        {alerta.respuesta.acciones.map((accion, index) => (
                          <li key={index}>{accion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>{alerta.respuesta.usuario}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatDateTime(alerta.respuesta.timestamp)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            {alerta.comentarios && alerta.comentarios.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Comentarios ({alerta.comentarios.length})
                </h4>
                <div className="space-y-2">
                  {alerta.comentarios.map((comentario) => (
                    <div key={comentario.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-sm font-medium text-white">
                          {comentario.usuario}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comentario.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 ml-5">{comentario.mensaje}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data generator
function generateMockAlertasCriticas(): AlertaCriticaHistorial[] {
  const usuarios = ['Sebastian Saucedo', 'Juan Pérez', 'María García', 'Carlos López'];
  const tiposRespuesta = ['Falsa alarma', 'Intervención exitosa', 'Problema resuelto', 'Acción preventiva'];
  
  return Array.from({ length: 20 }, (_, i) => {
    const isResolved = Math.random() > 0.3;
    const hasComments = Math.random() > 0.5;
    const timestamp = Date.now() / 1000 - Math.floor(Math.random() * 2592000); // Last 30 days
    
    return {
      id: `ALR-CRIT-${i + 1}`,
      tipo: 'violacion' as any,
      precintoId: `pr-${Math.floor(Math.random() * 100)}`,
      codigoPrecinto: `BT2024${String(Math.floor(Math.random() * 9000 + 1000)).padStart(4, '0')}`,
      mensaje: [
        'Apertura no autorizada del precinto detectada',
        'Violación del contenedor en zona restringida',
        'Precinto forzado - Intrusión detectada',
        'Alerta crítica: Manipulación del sistema de seguridad'
      ][Math.floor(Math.random() * 4)],
      timestamp,
      ubicacion: {
        lat: -34.9011 + (Math.random() - 0.5) * 0.1,
        lng: -56.1645 + (Math.random() - 0.5) * 0.1
      },
      severidad: 'critica' as any,
      atendida: isResolved,
      respuesta: isResolved ? {
        tipo: tiposRespuesta[Math.floor(Math.random() * tiposRespuesta.length)],
        descripcion: [
          'Se verificó en el lugar y fue una falsa alarma causada por condiciones climáticas.',
          'Se interceptó el vehículo y se detuvo a los responsables. Mercadería recuperada.',
          'Se activó protocolo de emergencia. Situación controlada sin pérdidas.',
          'Problema técnico del sensor. Se realizó mantenimiento correctivo.'
        ][Math.floor(Math.random() * 4)],
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        timestamp: timestamp + Math.floor(Math.random() * 3600),
        acciones: Math.random() > 0.5 ? [
          'Notificación a autoridades',
          'Despliegue de equipo de seguridad',
          'Revisión completa del contenedor',
          'Cambio de precinto'
        ].slice(0, Math.floor(Math.random() * 3) + 1) : undefined
      } : undefined,
      asignacion: Math.random() > 0.4 ? {
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        timestamp: timestamp + Math.floor(Math.random() * 600),
        notas: 'Asignado para investigación inmediata'
      } : undefined,
      comentarios: hasComments ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        id: `COM-${i}-${j}`,
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
        mensaje: [
          'Verificando con el equipo en campo',
          'Confirmado, procediendo según protocolo',
          'Situación bajo control',
          'Actualización: Todo en orden'
        ][Math.floor(Math.random() * 4)],
        timestamp: timestamp + Math.floor(Math.random() * 7200)
      })) : undefined
    };
  });
}