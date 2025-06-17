import React, { useState, useEffect } from 'react';
import { X, User, MessageSquare, CheckCircle, AlertTriangle, Clock, MapPin, Shield, Battery, Radio, Thermometer, Package, Navigation, Pause, Zap } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { formatDateTime, formatTimeAgo } from '../../../utils/formatters';
import type { AlertaExtendida, Usuario, ComentarioAlerta } from '../../../types';
import { TIPOS_ALERTA } from '../../../types/monitoring';
import { usuariosService } from '../../../services/usuarios.service';

interface AlertaDetalleModalProps {
  alerta: AlertaExtendida;
  isOpen: boolean;
  onClose: () => void;
  onAsignar: (usuarioId: string, notas?: string) => void;
  onComentar: (mensaje: string) => void;
  onResolver: (tipo: string, descripcion: string, acciones?: string[]) => void;
}

export const AlertaDetalleModal: React.FC<AlertaDetalleModalProps> = ({
  alerta,
  isOpen,
  onClose,
  onAsignar,
  onComentar,
  onResolver
}) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
  const [mostrarResolucion, setMostrarResolucion] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [notasAsignacion, setNotasAsignacion] = useState('');
  const [tipoResolucion, setTipoResolucion] = useState('resuelta');
  const [descripcionResolucion, setDescripcionResolucion] = useState('');
  const [accionesTomadas, setAccionesTomadas] = useState<string[]>(['']);

  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
    }
  }, [isOpen]);

  const cargarUsuarios = async () => {
    const [users, currentUser] = await Promise.all([
      usuariosService.getActivos(),
      usuariosService.getCurrentUser()
    ]);
    setUsuarios(users);
    setUsuarioActual(currentUser);
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'AAR': // Atraso en arribo de reporte
        return <Clock className="h-6 w-6" />;
      case 'BBJ': // Batería baja
        return <Battery className="h-6 w-6" />;
      case 'DEM': // Demorado
        return <Pause className="h-6 w-6" />;
      case 'DNR': // Desvío de ruta
        return <Navigation className="h-6 w-6" />;
      case 'DTN': // Detenido
        return <Shield className="h-6 w-6" />;
      case 'NPG': // Sin señal GPS
        return <Radio className="h-6 w-6" />;
      case 'NPN': // Sin reporte del precinto
        return <AlertTriangle className="h-6 w-6" />;
      case 'PTN': // Precinto abierto no autorizado
        return <Package className="h-6 w-6" />;
      case 'SNA': // Salida no autorizada
        return <Zap className="h-6 w-6" />;
      default:
        return <AlertTriangle className="h-6 w-6" />;
    }
  };

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return 'text-red-400 bg-red-900/20';
      case 'alta':
        return 'text-orange-400 bg-orange-900/20';
      case 'media':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'baja':
        return 'text-blue-400 bg-blue-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const handleAsignar = () => {
    if (usuarioSeleccionado) {
      onAsignar(usuarioSeleccionado, notasAsignacion);
      setMostrarAsignacion(false);
      setUsuarioSeleccionado('');
      setNotasAsignacion('');
    }
  };

  const handleComentar = () => {
    if (nuevoComentario.trim()) {
      onComentar(nuevoComentario);
      setNuevoComentario('');
    }
  };

  const handleResolver = () => {
    if (descripcionResolucion.trim()) {
      onResolver(tipoResolucion, descripcionResolucion, accionesTomadas.filter(a => a.trim()));
      setMostrarResolucion(false);
      setDescripcionResolucion('');
      setAccionesTomadas(['']);
    }
  };

  const agregarAccion = () => {
    setAccionesTomadas([...accionesTomadas, '']);
  };

  const actualizarAccion = (index: number, valor: string) => {
    const nuevasAcciones = [...accionesTomadas];
    nuevasAcciones[index] = valor;
    setAccionesTomadas(nuevasAcciones);
  };

  const eliminarAccion = (index: number) => {
    setAccionesTomadas(accionesTomadas.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full w-full max-w-[95vw]">
          {/* Header */}
          <div className="bg-gray-900 px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn('p-2 rounded-lg', getSeveridadColor(alerta.severidad))}>
                {getIcon(alerta.tipo)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Alerta #{alerta.id} - {alerta.codigoPrecinto}
                </h3>
                <p className="text-base text-gray-400">
                  {formatDateTime(alerta.timestamp)}
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

          {/* Content */}
          <div className="px-4 sm:px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Alert Details */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3">Detalles de la Alerta</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-white">{TIPOS_ALERTA[alerta.tipo as keyof typeof TIPOS_ALERTA] || alerta.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Severidad:</span>
                      <span className={cn('px-2 py-1 rounded-full text-sm font-medium', getSeveridadColor(alerta.severidad))}>
                        {alerta.severidad}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <span className={cn('text-base font-medium', 
                        alerta.resolucion ? 'text-green-400' : 
                        alerta.asignacion ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {alerta.resolucion ? 'Resuelta' : 
                         alerta.asignacion ? 'Asignada' : 'Sin asignar'}
                      </span>
                    </div>
                    {alerta.ubicacion && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ubicación:</span>
                        <span className="text-white text-base">
                          {alerta.ubicacion.lat.toFixed(4)}, {alerta.ubicacion.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-400 text-base">Mensaje:</p>
                    <p className="text-white mt-1">{alerta.mensaje}</p>
                  </div>
                </div>

                {/* Assignment */}
                {alerta.asignacion ? (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-3">Asignación</h4>
                    <div className="flex items-center space-x-3">
                      <img
                        src={alerta.asignacion.usuarioAsignado.avatar}
                        alt={alerta.asignacion.usuarioAsignado.nombre}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium">
                          {alerta.asignacion.usuarioAsignado.nombre}
                        </p>
                        <p className="text-sm text-gray-400">
                          Asignado {formatTimeAgo(alerta.asignacion.timestamp)}
                        </p>
                      </div>
                    </div>
                    {alerta.asignacion.notas && (
                      <p className="mt-3 text-sm text-gray-300 bg-gray-800 p-3 rounded">
                        {alerta.asignacion.notas}
                      </p>
                    )}
                  </div>
                ) : !alerta.resolucion && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    {mostrarAsignacion ? (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-white">Asignar a Usuario</h4>
                        <select
                          value={usuarioSeleccionado}
                          onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-base text-white"
                        >
                          <option value="">Seleccionar usuario...</option>
                          {usuarios.map(usuario => (
                            <option key={usuario.id} value={usuario.id}>
                              {usuario.nombre} - {usuario.rol}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={notasAsignacion}
                          onChange={(e) => setNotasAsignacion(e.target.value)}
                          placeholder="Notas de asignación (opcional)"
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-base text-white"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleAsignar}
                            disabled={!usuarioSeleccionado}
                            className="px-4 py-2 bg-blue-600 text-base text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Asignar
                          </button>
                          <button
                            onClick={() => setMostrarAsignacion(false)}
                            className="px-4 py-2 bg-gray-700 text-base text-white rounded-md hover:bg-gray-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMostrarAsignacion(true)}
                        className="w-full px-4 py-2 bg-blue-600 text-base text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Asignar Usuario</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Comments */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3">Comentarios</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {alerta.comentarios.length === 0 ? (
                      <p className="text-gray-400 text-base">No hay comentarios aún</p>
                    ) : (
                      alerta.comentarios.map((comentario) => (
                        <div key={comentario.id} className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-start space-x-3">
                            <img
                              src={comentario.usuario.avatar}
                              alt={comentario.usuario.nombre}
                              className="h-8 w-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-base font-medium text-white">
                                  {comentario.usuario.nombre}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {formatTimeAgo(comentario.timestamp)}
                                </p>
                              </div>
                              <p className="text-base text-gray-300 mt-1">
                                {comentario.mensaje}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Add Comment */}
                  {!alerta.resolucion && (
                    <div className="mt-4 flex space-x-2">
                      <input
                        type="text"
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleComentar()}
                        placeholder="Agregar comentario..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-base"
                      />
                      <button
                        onClick={handleComentar}
                        disabled={!nuevoComentario.trim()}
                        className="px-3 py-2 bg-blue-600 text-base text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Timeline */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3">Historial</h4>
                  <div className="space-y-3">
                    {alerta.historial.map((evento, index) => (
                      <div key={evento.id} className="flex items-start space-x-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-1.5',
                          index === 0 ? 'bg-blue-500' : 'bg-gray-600'
                        )} />
                        <div className="flex-1">
                          <p className="text-base text-white">
                            {evento.tipo === 'creada' && 'Alerta creada'}
                            {evento.tipo === 'asignada' && `Asignada a ${evento.usuario?.nombre}`}
                            {evento.tipo === 'comentario' && `Comentario de ${evento.usuario?.nombre}`}
                            {evento.tipo === 'resuelta' && 'Alerta resuelta'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatTimeAgo(evento.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                {alerta.resolucion ? (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-3">Resolución</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-medium">
                          {alerta.resolucion.tipoResolucion.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-base text-gray-300">
                        {alerta.resolucion.descripcion}
                      </p>
                      {alerta.resolucion.accionesTomadas && alerta.resolucion.accionesTomadas.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-400 mb-1">Acciones tomadas:</p>
                          <ul className="list-disc list-inside text-base text-gray-300 space-y-1">
                            {alerta.resolucion.accionesTomadas.map((accion, i) => (
                              <li key={i}>{accion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                          Resuelto por {alerta.resolucion.resueltoPor.nombre}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDateTime(alerta.resolucion.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : !mostrarResolucion && alerta.asignacion && (
                  <button
                    onClick={() => setMostrarResolucion(true)}
                    className="w-full px-4 py-2 bg-green-600 text-base text-white rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Resolver Alerta</span>
                  </button>
                )}

                {/* Resolution Form */}
                {mostrarResolucion && (
                  <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                    <h4 className="text-lg font-medium text-white">Resolver Alerta</h4>
                    <select
                      value={tipoResolucion}
                      onChange={(e) => setTipoResolucion(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-base"
                    >
                      <option value="resuelta">Resuelta</option>
                      <option value="falsa_alarma">Falsa Alarma</option>
                      <option value="duplicada">Duplicada</option>
                      <option value="sin_accion">Sin Acción Requerida</option>
                    </select>
                    <textarea
                      value={descripcionResolucion}
                      onChange={(e) => setDescripcionResolucion(e.target.value)}
                      placeholder="Descripción de la resolución..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-base"
                      rows={3}
                    />
                    <div>
                      <p className="text-base text-gray-400 mb-2">Acciones tomadas:</p>
                      {accionesTomadas.map((accion, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                          <input
                            type="text"
                            value={accion}
                            onChange={(e) => actualizarAccion(index, e.target.value)}
                            placeholder="Acción tomada..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white text-base"
                          />
                          {accionesTomadas.length > 1 && (
                            <button
                              onClick={() => eliminarAccion(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={agregarAccion}
                        className="text-base text-blue-400 hover:text-blue-300"
                      >
                        + Agregar acción
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleResolver}
                        disabled={!descripcionResolucion.trim()}
                        className="flex-1 px-4 py-2 bg-green-600 text-base text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Resolver
                      </button>
                      <button
                        onClick={() => {
                          setMostrarResolucion(false);
                          setDescripcionResolucion('');
                          setAccionesTomadas(['']);
                        }}
                        className="px-4 py-2 bg-gray-700 text-base text-white rounded-md hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3">Métricas</h4>
                  <div className="space-y-2">
                    {alerta.tiempoRespuesta && (
                      <div>
                        <p className="text-sm text-gray-400">Tiempo de respuesta</p>
                        <p className="text-base text-white">
                          {Math.floor(alerta.tiempoRespuesta / 60)} min
                        </p>
                      </div>
                    )}
                    {alerta.tiempoResolucion && (
                      <div>
                        <p className="text-sm text-gray-400">Tiempo de resolución</p>
                        <p className="text-base text-white">
                          {Math.floor(alerta.tiempoResolucion / 3600)} hrs
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400">Comentarios</p>
                      <p className="text-base text-white">{alerta.comentarios.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};