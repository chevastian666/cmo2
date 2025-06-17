import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Truck, 
  Calendar, 
  User,
  Route,
  AlertCircle,
  Download,
  Edit,
  Camera,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardContent, Badge, LoadingState } from '../../../components/ui';
import { useCamionesStore } from '../../../store/camionesStore';
import { useUserInfo } from '../../../hooks/useAuth';
import { exportToCSV } from '../../../utils/export';
import { notificationService } from '../../../services/shared/notification.service';
import { cn } from '../../../utils/utils';
import { ESTADOS_CAMION } from '../types';

interface FichaCamionProps {
  matricula: string;
  onClose: () => void;
}

export const FichaCamion: React.FC<FichaCamionProps> = ({ matricula, onClose }) => {
  const userInfo = useUserInfo();
  const canEdit = userInfo.role === 'admin' || userInfo.role === 'supervisor' || userInfo.role === 'encargado';
  
  const {
    camionSeleccionado,
    transitosCamion,
    estadisticasCamion,
    loading,
    selectCamion,
    updateCamion,
    uploadFotoCamion,
    clearSelection
  } = useCamionesStore();

  useEffect(() => {
    selectCamion(matricula);
    return () => clearSelection();
  }, [matricula, selectCamion, clearSelection]);

  const handleExportarHistorial = () => {
    if (!transitosCamion.length) {
      notificationService.warning('Sin datos', 'No hay tránsitos para exportar');
      return;
    }

    const datos = transitosCamion.map(t => ({
      Fecha: new Date(t.fecha).toLocaleDateString('es-UY'),
      Hora: new Date(t.fecha).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
      Origen: t.origen,
      Destino: t.destino,
      Estado: t.estado,
      Precinto: t.precinto,
      Camionero: t.camionero?.nombre || 'No registrado',
      Documento: t.camionero?.documento || '-'
    }));

    exportToCSV(datos, `historial_${matricula}_${new Date().toISOString().split('T')[0]}`);
    notificationService.success('Éxito', 'Historial exportado correctamente');
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && camionSeleccionado) {
      await uploadFotoCamion(camionSeleccionado.matricula, file);
    }
  };

  if (loading || !camionSeleccionado) {
    return <LoadingState message="Cargando información del camión..." />;
  }

  const estadoConfig = ESTADOS_CAMION[camionSeleccionado.estado];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Truck className="h-8 w-8 text-blue-500" />
              {camionSeleccionado.matricula}
            </h2>
            <Badge variant={estadoConfig.color as any} className="mt-1">
              {estadoConfig.icon} {estadoConfig.label}
            </Badge>
          </div>
        </div>
        
        <button
          onClick={handleExportarHistorial}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar historial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-1 space-y-6">
          {/* Foto del camión */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Fotografía</h3>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {camionSeleccionado.foto ? (
                  <img 
                    src={camionSeleccionado.foto} 
                    alt={camionSeleccionado.matricula}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-800 rounded-lg flex flex-col items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Sin fotografía</p>
                  </div>
                )}
                
                {canEdit && (
                  <label className="absolute bottom-2 right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                    <Camera className="h-5 w-5" />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del camión */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Información</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Fecha de registro</p>
                <p className="text-white">
                  {camionSeleccionado.fechaRegistro.toLocaleDateString('es-UY')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Última actualización</p>
                <p className="text-white">
                  {camionSeleccionado.fechaActualizacion.toLocaleDateString('es-UY')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Registrado por</p>
                <p className="text-white">{camionSeleccionado.creadoPor.nombre}</p>
              </div>

              {canEdit && (
                <div className="pt-4 border-t border-gray-700">
                  <label className="text-sm text-gray-400 mb-2 block">
                    Observaciones
                  </label>
                  <textarea
                    value={camionSeleccionado.observaciones || ''}
                    onChange={(e) => updateCamion(matricula, { observaciones: e.target.value })}
                    placeholder="Agregar observaciones..."
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas */}
          {estadisticasCamion && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Estadísticas
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-white">
                      {estadisticasCamion.totalTransitos}
                    </p>
                    <p className="text-xs text-gray-400">Total tránsitos</p>
                  </div>
                  <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-600">
                    <p className="text-2xl font-bold text-blue-400">
                      {estadisticasCamion.transitosUltimos30Dias}
                    </p>
                    <p className="text-xs text-gray-400">Últimos 30 días</p>
                  </div>
                </div>

                {estadisticasCamion.camioneroFrecuente && (
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Camionero frecuente</p>
                    <p className="text-white font-medium">
                      {estadisticasCamion.camioneroFrecuente.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {estadisticasCamion.camioneroFrecuente.cantidadViajes} viajes
                    </p>
                  </div>
                )}

                {estadisticasCamion.rutasFrecuentes.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Rutas frecuentes</p>
                    <div className="space-y-2">
                      {estadisticasCamion.rutasFrecuentes.slice(0, 3).map((ruta, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                          <div className="flex items-center gap-2">
                            <Route className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-white">
                              {ruta.origen} → {ruta.destino}
                            </span>
                          </div>
                          <Badge variant="gray" className="text-xs">
                            {ruta.cantidad}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Historial de tránsitos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">
                Historial de Tránsitos
              </h3>
            </CardHeader>
            <CardContent>
              {transitosCamion.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No hay tránsitos registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Fecha</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Origen</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Destino</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Camionero</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Precinto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transitosCamion.map((transito) => (
                        <tr key={transito.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            <div className="text-sm text-white">
                              {new Date(transito.fecha).toLocaleDateString('es-UY')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transito.fecha).toLocaleTimeString('es-UY', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-white">{transito.origen}</td>
                          <td className="py-3 px-4 text-sm text-white">{transito.destino}</td>
                          <td className="py-3 px-4">
                            {transito.camionero ? (
                              <div>
                                <p className="text-sm text-white">{transito.camionero.nombre}</p>
                                <p className="text-xs text-gray-500">{transito.camionero.documento}</p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No registrado</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                transito.estado === 'finalizado' ? 'green' :
                                transito.estado === 'en_transito' ? 'blue' :
                                transito.estado === 'alerta' ? 'red' : 'gray'
                              }
                              className="text-xs"
                            >
                              {transito.estado}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-400 font-mono">
                            {transito.precinto}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};