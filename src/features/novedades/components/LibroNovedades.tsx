import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge } from '../../../components/ui';
import { FormularioNovedad } from './FormularioNovedad';
import { TimelineNovedades } from './TimelineNovedades';
import { FiltrosNovedadesComponent } from './FiltrosNovedades';
import { ModalSeguimiento } from './ModalSeguimiento';
import { ModalResolucion } from './ModalResolucion';
import { useNovedadesStore } from '../../../store/novedadesStore';
import { useUserInfo } from '../../../hooks/useAuth';
import { notificationService } from '../../../services/shared/notification.service';
import { exportToCSV } from '../../../utils/export';
import type { Novedad, FiltrosNovedades } from '../types';
import { FILTROS_DEFAULT, TIPOS_NOVEDAD } from '../types';

const STORAGE_KEY_FILTROS = 'cmo_novedades_filtros';

export const LibroNovedades: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosNovedades>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FILTROS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convertir strings de fecha a objetos Date
      return {
        ...parsed,
        fecha: parsed.fecha ? new Date(parsed.fecha) : null,
        fechaDesde: parsed.fechaDesde ? new Date(parsed.fechaDesde) : null,
        fechaHasta: parsed.fechaHasta ? new Date(parsed.fechaHasta) : null
      };
    }
    return FILTROS_DEFAULT;
  });
  const [novedadSeguimiento, setNovedadSeguimiento] = useState<Novedad | null>(null);
  const [novedadResolucion, setNovedadResolucion] = useState<Novedad | null>(null);
  
  const { novedades, estadisticas, loading, fetchNovedades, crearNovedad, marcarResuelta, agregarSeguimiento } = useNovedadesStore();
  const userInfo = useUserInfo();
  
  const canEdit = userInfo.role === 'admin' || userInfo.role === 'supervisor' || userInfo.role === 'encargado';

  // Cargar novedades al montar y cuando cambien los filtros
  useEffect(() => {
    fetchNovedades(filtros);
  }, [fetchNovedades, filtros]);

  // Guardar filtros en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILTROS, JSON.stringify(filtros));
  }, [filtros]);

  // Auto-refresh cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNovedades(filtros);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchNovedades, filtros]);

  const handleCrearNovedad = async (data: any) => {
    await crearNovedad(data);
    // Si hay archivos, aquí se subirían
    if (data.archivos) {
      console.log('Archivos a subir:', data.archivos);
    }
  };

  const handleMarcarResuelta = async (novedadId: string, comentario?: string) => {
    try {
      await marcarResuelta(novedadId, comentario);
      notificationService.success('Novedad resuelta', 'La novedad se ha marcado como resuelta');
      setNovedadResolucion(null);
    } catch (error) {
      notificationService.error('Error', 'No se pudo marcar la novedad como resuelta');
    }
  };

  const handleAgregarSeguimiento = async (novedadId: string, comentario: string) => {
    try {
      await agregarSeguimiento(novedadId, comentario);
      notificationService.success('Seguimiento agregado', 'Se ha agregado el seguimiento correctamente');
      setNovedadSeguimiento(null);
    } catch (error) {
      notificationService.error('Error', 'No se pudo agregar el seguimiento');
    }
  };

  const handleExportar = () => {
    const datosExportar = novedades.map(nov => ({
      Fecha: nov.fecha.toLocaleDateString('es-UY'),
      Hora: nov.fechaCreacion.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
      'Punto Operación': nov.puntoOperacion,
      Tipo: TIPOS_NOVEDAD[nov.tipoNovedad].label,
      Descripción: nov.descripcion,
      Estado: nov.estado === 'resuelta' ? 'Resuelta' : nov.estado === 'seguimiento' ? 'En seguimiento' : 'Activa',
      'Creado por': nov.creadoPor.nombre,
      'Resuelto por': nov.resolucion?.usuario.nombre || '-',
      'Comentario resolución': nov.resolucion?.comentario || '-',
      Seguimientos: nov.seguimientos?.length || 0
    }));

    exportToCSV(datosExportar, `novedades_${new Date().toISOString().split('T')[0]}`);
    notificationService.success('Exportación completada', 'Las novedades se han exportado correctamente');
  };

  // Filtrar novedades según usuario si está marcado "solo mías"
  const novedadesFiltradas = filtros.soloMias 
    ? novedades.filter(n => n.creadoPor.id === userInfo.id)
    : novedades;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna izquierda - Formulario y estadísticas */}
      <div className="lg:col-span-1 space-y-6">
        {/* Formulario de nueva novedad */}
        {canEdit && (
          <FormularioNovedad
            onSubmit={handleCrearNovedad}
            puntoOperacionDefault={userInfo.puntoOperacion}
          />
        )}

        {/* Estadísticas del día */}
        {estadisticas && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Resumen del día
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-white">{estadisticas.totalDia}</p>
                  <p className="text-xs text-gray-400">Total hoy</p>
                </div>
                <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-600">
                  <p className="text-2xl font-bold text-green-400">{estadisticas.resueltas}</p>
                  <p className="text-xs text-gray-400">Resueltas</p>
                </div>
                <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-600">
                  <p className="text-2xl font-bold text-yellow-400">{estadisticas.enSeguimiento}</p>
                  <p className="text-xs text-gray-400">En seguimiento</p>
                </div>
                <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-600">
                  <p className="text-2xl font-bold text-blue-400">{estadisticas.pendientes}</p>
                  <p className="text-xs text-gray-400">Pendientes</p>
                </div>
              </div>

              {/* Por tipo */}
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Por tipo:</p>
                {Object.entries(estadisticas.porTipo).map(([tipo, cantidad]) => {
                  const config = TIPOS_NOVEDAD[tipo as keyof typeof TIPOS_NOVEDAD];
                  return (
                    <div key={tipo} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 flex items-center gap-2">
                        <span>{config.icon}</span>
                        {config.label}
                      </span>
                      <Badge variant={config.color as any} className="text-xs">
                        {cantidad}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Columna derecha - Timeline */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Libro de Novedades</h2>
            <p className="text-gray-400 mt-1 text-base sm:text-lg">
              Registro diario de eventos operativos
            </p>
          </div>
          {novedadesFiltradas.length > 0 && (
            <button
              onClick={handleExportar}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          )}
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <FiltrosNovedadesComponent
              filtros={filtros}
              onFiltrosChange={setFiltros}
            />
          </CardContent>
        </Card>

        {/* Timeline de novedades */}
        <TimelineNovedades
          novedades={novedadesFiltradas}
          loading={loading}
          onMarcarResuelta={canEdit ? setNovedadResolucion : undefined}
          onAgregarSeguimiento={canEdit ? setNovedadSeguimiento : undefined}
          onEditar={canEdit ? (nov) => console.log('Editar:', nov) : undefined}
          onVerDetalles={(nov) => console.log('Ver detalles:', nov)}
          canEdit={canEdit}
          userId={userInfo.id}
        />
      </div>

      {/* Modales */}
      <ModalSeguimiento
        novedad={novedadSeguimiento}
        isOpen={!!novedadSeguimiento}
        onClose={() => setNovedadSeguimiento(null)}
        onSubmit={handleAgregarSeguimiento}
      />

      <ModalResolucion
        novedad={novedadResolucion}
        isOpen={!!novedadResolucion}
        onClose={() => setNovedadResolucion(null)}
        onSubmit={handleMarcarResuelta}
      />
    </div>
  );
};