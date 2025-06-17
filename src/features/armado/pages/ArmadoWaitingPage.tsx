import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, CheckCircle, AlertCircle, Clock, MapPin, Truck, User, 
  Phone, Calendar, FileText, ExternalLink, Copy, Download, Loader,
  XCircle, RefreshCw
} from 'lucide-react';
import { cn } from '../../../utils/utils';
import { armadoService } from '../services/armado.service';
import { notificationService } from '../../../services/shared/notification.service';

interface TransitData {
  pvid: string;
  precintoid: string;
  track: string;
  empresaid: string;
  fecha: number;
  DUA: string;
  VjeId: string;
  MovId: string;
  PrcId: string;
  MatTra: string;
  MatTraOrg: string;
  MatZrr?: string;
  MatRemo?: string;
  ConNmb: string;
  ConNDoc: string;
  ConTel: string;
  ConTelConf?: string;
  plidEnd: string;
  depEnd: string;
  status: string;
  pstatus: Array<{
    event: string;
    status: string;
    tsent: number;
    tresponse: number;
    Errnum?: string;
    Errmsj?: string;
    retry: number;
  }>;
  aduana?: Array<{
    praid: string;
    OprId: 'SAL' | 'LLE' | 'LBR' | string;
    Canal?: 'ROJO' | 'VERDE' | 'NARANJA';
    trequest: number;
  }>;
}

const UBICACIONES: Record<string, string> = {
  '1': 'Puerto',
  '2': 'ZF Florida',
  '3': 'ZF Libertad',
  '4': 'Aeropuerto',
  '5': 'Chuy',
  '6': 'Rio Branco',
  '7': 'Rivera',
  '8': 'Fray Bentos',
  '9': 'Colonia',
  '10': 'Punta del Este',
  '11': 'Acegua',
  '12': 'Artigas',
  '13': 'Bella Union',
  '14': 'Salto',
  '15': 'Paysandu',
  '16': 'Nueva Palmira'
};

export const ArmadoWaitingPage: React.FC = () => {
  const { transitId } = useParams<{ transitId: string }>();
  const navigate = useNavigate();
  const [transitData, setTransitData] = useState<TransitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exitConfirmed, setExitConfirmed] = useState(false);
  const [pollingActive, setPollingActive] = useState(true);

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('es-UY', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('es-UY', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDateTime = (timestamp: number) => {
    return `${formatDate(timestamp)}, ${formatTime(timestamp)}`;
  };

  // Calculate time ago
  const timeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return days === 1 ? 'ayer' : `hace ${days} días`;
    } else if (hours > 0) {
      return hours === 1 ? 'hace 1 hora' : `hace ${hours} horas`;
    } else if (minutes > 0) {
      return minutes === 1 ? 'hace 1 minuto' : `hace ${minutes} minutos`;
    } else {
      return 'hace un momento';
    }
  };

  // Get status message for customs operation
  const getCustomsMessage = (oprId: string, canal?: string) => {
    switch (oprId) {
      case 'SAL':
        return 'Salida de aduana confirmada';
      case 'LLE':
        if (canal === 'ROJO') {
          return 'Revisión aduanera pendiente';
        }
        return 'Llegada a aduana confirmada';
      case 'LBR':
        return 'Liberación confirmada';
      default:
        return 'Estado desconocido';
    }
  };

  // Get status color
  const getStatusColor = (oprId: string, canal?: string) => {
    if (oprId === 'SAL' || oprId === 'LBR') return 'success';
    if (oprId === 'LLE' && canal === 'ROJO') return 'danger';
    if (oprId === 'LLE') return 'success';
    return 'warning';
  };

  // Fetch transit data
  const fetchTransitData = async () => {
    if (!transitId) return;

    try {
      // In a real implementation, this would call the API
      // For now, we'll use mock data based on the HTML example
      const mockData: TransitData = {
        pvid: transitId,
        precintoid: '549',
        track: '16-06-25-48/URAZD',
        empresaid: '176',
        fecha: Date.now() / 1000,
        DUA: '789125',
        VjeId: '7592862',
        MovId: '2',
        PrcId: '549',
        MatTra: 'MTP2892',
        MatTraOrg: '858',
        MatZrr: 'mtp1329',
        ConNmb: 'Milton Muceta',
        ConNDoc: '26211536',
        ConTel: '091213462',
        ConTelConf: '091213462',
        plidEnd: '8',
        depEnd: '6081',
        status: '1',
        pstatus: [
          {
            event: 'startV',
            status: 'OK',
            tsent: Date.now() / 1000 - 300,
            tresponse: Date.now() / 1000 - 298,
            retry: 0
          },
          {
            event: 'startP',
            status: 'OK',
            tsent: Date.now() / 1000 - 295,
            tresponse: Date.now() / 1000 - 293,
            retry: 0
          },
          {
            event: 'image',
            status: 'OK',
            tsent: Date.now() / 1000 - 290,
            tresponse: Date.now() / 1000 - 288,
            Errnum: '0',
            Errmsj: 'OK',
            retry: 0
          }
        ],
        aduana: [
          {
            praid: '242338',
            OprId: 'SAL',
            trequest: Date.now() / 1000 - 1620 // 27 minutes ago
          }
        ]
      };

      setTransitData(mockData);
      setLoading(false);

      // Check if exit is already confirmed
      const hasExit = mockData.aduana?.some(a => a.OprId === 'SAL');
      if (hasExit) {
        setExitConfirmed(true);
        setPollingActive(false);
      }
    } catch (error) {
      console.error('Error fetching transit data:', error);
      notificationService.error('Error', 'No se pudo cargar la información del tránsito');
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notificationService.success('Copiado', 'Enlace copiado al portapapeles');
  };

  // Handle exit confirmation
  const handleConfirmExit = async () => {
    if (!transitData) return;

    try {
      // In a real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExitConfirmed(true);
      setPollingActive(false);
      notificationService.success('Confirmado', 'Salida confirmada exitosamente');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/transitos');
      }, 2000);
    } catch (error) {
      notificationService.error('Error', 'No se pudo confirmar la salida');
    }
  };

  // Handle change precinto
  const handleChangePrecinto = () => {
    notificationService.info('Función no disponible', 'Esta función estará disponible próximamente');
  };

  // Polling effect
  useEffect(() => {
    fetchTransitData();

    if (pollingActive) {
      const interval = setInterval(() => {
        fetchTransitData();
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }
  }, [transitId, pollingActive]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!transitData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <XCircle className="h-16 w-16 text-red-500" />
        <p className="text-xl text-gray-400">No se encontró información del tránsito</p>
        <button
          onClick={() => navigate('/armado')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver a Armado
        </button>
      </div>
    );
  }

  const hasCustomsExit = transitData.aduana?.some(a => a.OprId === 'SAL');
  const lastCustomsStatus = transitData.aduana?.[transitData.aduana.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="h-8 w-8 text-blue-500" />
          Estado del Armado
        </h1>
        <p className="text-gray-400 mt-1">
          Esperando confirmación de aduana para el tránsito
        </p>
      </div>

      {/* Main Status Card */}
      <div className={cn(
        "bg-gray-800 rounded-lg shadow-lg overflow-hidden",
        hasCustomsExit && "animate-pulse-success"
      )}>
        {/* Header Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase">ID de Viaje</p>
              <p className="text-lg font-bold text-white">{transitData.VjeId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">ID Mov.</p>
              <p className="text-lg font-semibold text-gray-300">{transitData.MovId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">DUA</p>
              <p className="text-lg font-bold text-white">{transitData.DUA}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Precinto</p>
              <p className="text-lg font-semibold text-gray-300">{transitData.PrcId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Matrícula</p>
              <p className="text-lg font-semibold text-gray-300">
                {transitData.MatTra}
                <span className="text-sm text-gray-500 ml-1">({transitData.MatTraOrg})</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Destino</p>
              <p className="text-lg font-semibold text-gray-300">
                {UBICACIONES[transitData.plidEnd] || transitData.plidEnd}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Conductor</p>
                <p className="text-sm text-white">
                  {transitData.ConNmb} 
                  <span className="text-gray-500 ml-1">({transitData.ConNDoc})</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Teléfono</p>
                <p className="text-sm text-white">{transitData.ConTel}</p>
                {transitData.ConTelConf && transitData.ConTelConf !== transitData.ConTel && (
                  <p className="text-xs text-green-400">Confirmado: {transitData.ConTelConf}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Fecha</p>
                <p className="text-sm text-white">
                  {formatDate(transitData.fecha)} {formatTime(transitData.fecha)}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Links */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-400">Rastreo:</span>
            </div>
            <a 
              href={`https://track.trokor.com/${transitData.track}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm">Ver en mapa</span>
            </a>
            <button
              onClick={() => copyToClipboard(`https://track.trokor.com/${transitData.track}`)}
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">Copiar enlace</span>
            </button>
            <a 
              href={`/getlog?precintoid=${transitData.precintoid}&pvid=${transitData.pvid}`}
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-bold">KML</span>
            </a>
          </div>
        </div>

        {/* Status Table */}
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Estados del Sistema</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-2 text-sm font-medium text-gray-400">Evento</th>
                  <th className="pb-2 text-sm font-medium text-gray-400">Estado</th>
                  <th className="pb-2 text-sm font-medium text-gray-400">Enviado</th>
                  <th className="pb-2 text-sm font-medium text-gray-400">Respuesta</th>
                  <th className="pb-2 text-sm font-medium text-gray-400">Error</th>
                  <th className="pb-2 text-sm font-medium text-gray-400">Reintentos</th>
                </tr>
              </thead>
              <tbody>
                {transitData.pstatus.map((status, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3">
                      <span className="text-sm font-medium text-white">{status.event}</span>
                    </td>
                    <td className="py-3">
                      <span className={cn(
                        "text-sm font-bold",
                        status.status === 'OK' ? "text-green-400" : "text-red-400"
                      )}>
                        {status.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      {formatDateTime(status.tsent)}
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      {formatDateTime(status.tresponse)}
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      {status.Errmsj || '-'}
                    </td>
                    <td className="py-3 text-sm text-gray-300">{status.retry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customs Status */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <RefreshCw className={cn(
              "h-5 w-5",
              pollingActive && "animate-spin"
            )} />
            Estados de Aduana
          </h3>
          
          {transitData.aduana && transitData.aduana.length > 0 ? (
            <div className="space-y-3">
              {transitData.aduana.map((status, index) => {
                const isLast = index === transitData.aduana!.length - 1;
                const statusColor = getStatusColor(status.OprId, status.Canal);
                
                return (
                  <div
                    key={status.praid}
                    className={cn(
                      "p-4 rounded-lg flex items-center justify-between",
                      statusColor === 'success' && "bg-green-900/30 border border-green-800",
                      statusColor === 'danger' && "bg-red-900/30 border border-red-800",
                      statusColor === 'warning' && "bg-yellow-900/30 border border-yellow-800",
                      isLast && "animate-pulse"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        {statusColor === 'success' && <CheckCircle className="h-6 w-6 text-green-400" />}
                        {statusColor === 'danger' && <XCircle className="h-6 w-6 text-red-400" />}
                        {statusColor === 'warning' && <AlertCircle className="h-6 w-6 text-yellow-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {status.praid} - {status.OprId}
                        </p>
                        <p className={cn(
                          "text-sm",
                          statusColor === 'success' && "text-green-300",
                          statusColor === 'danger' && "text-red-300",
                          statusColor === 'warning' && "text-yellow-300"
                        )}>
                          {getCustomsMessage(status.OprId, status.Canal)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{timeAgo(status.trequest)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg p-8 text-center">
              <Clock className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Esperando respuesta de aduana...</p>
              <p className="text-sm text-gray-500 mt-1">Se actualiza automáticamente cada 10 segundos</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-700/50 space-y-3">
          {!exitConfirmed ? (
            <button
              onClick={handleConfirmExit}
              disabled={!hasCustomsExit}
              className={cn(
                "w-full py-4 px-6 rounded-lg font-medium text-lg flex items-center justify-center space-x-2 transition-colors",
                hasCustomsExit
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              )}
            >
              <CheckCircle className="h-6 w-6" />
              <span>{hasCustomsExit ? 'Salida confirmada' : 'Esperando confirmación de salida'}</span>
            </button>
          ) : (
            <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-medium">Salida confirmada exitosamente</p>
              <p className="text-sm text-gray-400 mt-1">Redirigiendo a tránsitos...</p>
            </div>
          )}

          {!exitConfirmed && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
              <p className="text-red-300 text-sm text-center">
                No olvidarse de confirmar la llamada telefónica.
              </p>
            </div>
          )}

          <button
            onClick={handleChangePrecinto}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Cambiar precinto</span>
          </button>
        </div>
      </div>
    </div>
  );
};