import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone,
  Flag,
  Truck,
  Calendar,
  Activity,
  Route,
  Download,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardContent, Badge, LoadingState } from '../../../components/ui';
import { useCamionerosStore } from '../../../store/camionerosStore';
import { useUserInfo } from '../../../hooks/useAuth';
import { exportToCSV } from '../../../utils/export';
import { notificationService } from '../../../services/shared/notification.service';
import { cn } from '../../../utils/utils';
import { NACIONALIDADES, TIPOS_DOCUMENTO } from '../types';
import { ESTADOS_CAMION } from '../../camiones/types';

interface FichaCamioneroProps {
  documento: string;
  onClose: () => void;
}

export const FichaCamionero: React.FC<FichaCamioneroProps> = ({ documento, onClose }) => {
  const userInfo = useUserInfo();
  const canEdit = userInfo.role === 'admin' || userInfo.role === 'supervisor' || userInfo.role === 'encargado';
  
  const {
    camioneroSeleccionado,
    transitosCamionero,
    matriculasFrecuentes,
    estadisticasCamionero,
    loading,
    selectCamionero,
    updateCamionero,
    clearSelection
  } = useCamionerosStore();

  useEffect(() => {
    selectCamionero(documento);
    return () => clearSelection();
  }, [documento, selectCamionero, clearSelection]);

  const handleExportarHistorial = () => {
    if (!transitosCamionero.length) {
      notificationService.warning('Sin datos', 'No hay tránsitos para exportar');
      return;
    }

    const datos = transitosCamionero.map(t => ({
      Fecha: new Date(t.fecha).toLocaleDateString('es-UY'),
      Hora: new Date(t.fecha).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
      Matrícula: t.matricula,
      Origen: t.origen,
      Destino: t.destino,
      Estado: t.estado,
      Precinto: t.precinto
    }));

    const nombreArchivo = camioneroSeleccionado 
      ? `historial_${camioneroSeleccionado.nombre}_${camioneroSeleccionado.apellido}_${new Date().toISOString().split('T')[0]}`
      : 'historial_camionero';

    exportToCSV(datos, nombreArchivo);
    notificationService.success('Éxito', 'Historial exportado correctamente');
  };

  if (loading || !camioneroSeleccionado) {
    return <LoadingState message="Cargando información del camionero..." />;
  }

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
              <User className="h-8 w-8 text-blue-500" />
              {camioneroSeleccionado.nombre} {camioneroSeleccionado.apellido}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="gray">
                {TIPOS_DOCUMENTO[camioneroSeleccionado.tipoDocumento]}: {camioneroSeleccionado.documento}
              </Badge>
              <span className="text-gray-400">
                {NACIONALIDADES[camioneroSeleccionado.nacionalidad]}
              </span>
            </div>
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
        {/* Información personal */}
        <div className="lg:col-span-1 space-y-6">
          {/* Datos personales */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Información Personal</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Documento</p>
                <p className="text-white font-mono">
                  {camioneroSeleccionado.documento}
                </p>
                <p className="text-xs text-gray-500">
                  {TIPOS_DOCUMENTO[camioneroSeleccionado.tipoDocumento]}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Nacionalidad</p>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-gray-500" />
                  <p className="text-white">
                    {NACIONALIDADES[camioneroSeleccionado.nacionalidad]}
                  </p>
                </div>
                {camioneroSeleccionado.nacionalidad === 'Otro' && camioneroSeleccionado.paisOrigen && (
                  <p className="text-sm text-gray-500 mt-1">
                    País: {camioneroSeleccionado.paisOrigen}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">Teléfonos de contacto</p>
                {camioneroSeleccionado.telefonoUruguayo && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-white">
                      🇺🇾 {camioneroSeleccionado.telefonoUruguayo}
                    </p>
                  </div>
                )}
                {camioneroSeleccionado.telefonoPais && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-white">
                      {camioneroSeleccionado.nacionalidad === 'Argentina' && '🇦🇷'}
                      {camioneroSeleccionado.nacionalidad === 'Brasil' && '🇧🇷'}
                      {camioneroSeleccionado.nacionalidad === 'Paraguay' && '🇵🇾'}
                      {camioneroSeleccionado.nacionalidad === 'Chile' && '🇨🇱'}
                      {camioneroSeleccionado.nacionalidad === 'Bolivia' && '🇧🇴'}
                      {camioneroSeleccionado.nacionalidad === 'Otro' && '🌍'}
                      {' '}
                      {camioneroSeleccionado.telefonoPais}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-700">
                <p className="text-sm text-gray-400">Fecha de registro</p>
                <p className="text-white">
                  {camioneroSeleccionado.fechaRegistro.toLocaleDateString('es-UY')}
                </p>
              </div>

              {canEdit && (
                <div className="pt-4 border-t border-gray-700">
                  <label className="text-sm text-gray-400 mb-2 block">
                    Comentarios / Observaciones
                  </label>
                  <textarea
                    value={camioneroSeleccionado.comentario || ''}
                    onChange={(e) => updateCamionero(documento, { comentario: e.target.value })}
                    placeholder="Agregar comentarios..."
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas */}
          {estadisticasCamionero && (
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
                      {estadisticasCamionero.totalTransitos}
                    </p>
                    <p className="text-xs text-gray-400">Total tránsitos</p>
                  </div>
                  <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-600">
                    <p className="text-2xl font-bold text-blue-400">
                      {estadisticasCamionero.transitosUltimos30Dias}
                    </p>
                    <p className="text-xs text-gray-400">Últimos 30 días</p>
                  </div>
                </div>

                {estadisticasCamionero.rutasFrecuentes.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Rutas frecuentes</p>
                    <div className="space-y-2">
                      {estadisticasCamionero.rutasFrecuentes.slice(0, 3).map((ruta, idx) => (
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

        {/* Matrículas frecuentes e historial */}
        <div className="lg:col-span-2 space-y-6">
          {/* Matrículas frecuentes */}
          {matriculasFrecuentes.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-500" />
                  Camiones Utilizados Frecuentemente
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matriculasFrecuentes.map((matricula) => {
                    const estadoConfig = matricula.camion?.estado 
                      ? ESTADOS_CAMION[matricula.camion.estado as keyof typeof ESTADOS_CAMION]
                      : null;
                    
                    return (
                      <div key={matricula.matricula} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          {matricula.camion?.foto ? (
                            <img 
                              src={matricula.camion.foto} 
                              alt={matricula.matricula}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                              <Truck className="h-8 w-8 text-gray-600" />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <p className="font-bold text-white text-lg">
                              {matricula.matricula}
                            </p>
                            {estadoConfig && (
                              <Badge variant={estadoConfig.color as any} className="text-xs mb-1">
                                {estadoConfig.icon} {estadoConfig.label}
                              </Badge>
                            )}
                            <p className="text-sm text-gray-400">
                              {matricula.cantidadViajes} viajes
                            </p>
                            <p className="text-xs text-gray-500">
                              Último: {new Date(matricula.ultimoViaje).toLocaleDateString('es-UY')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial de tránsitos */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">
                Historial de Tránsitos
              </h3>
            </CardHeader>
            <CardContent>
              {transitosCamionero.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No hay tránsitos registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Fecha</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Matrícula</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Origen</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Destino</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Precinto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transitosCamionero.map((transito) => (
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
                          <td className="py-3 px-4 text-sm text-white font-mono">
                            {transito.matricula}
                          </td>
                          <td className="py-3 px-4 text-sm text-white">{transito.origen}</td>
                          <td className="py-3 px-4 text-sm text-white">{transito.destino}</td>
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