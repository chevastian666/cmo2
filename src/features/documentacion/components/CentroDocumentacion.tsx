import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download, Upload, Search } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge } from '../../../components/ui';
import { SubirDocumentoModal } from './SubirDocumentoModal';
import { FiltrosDocumentosComponent } from './FiltrosDocumentos';
import { TablaDocumentos } from './TablaDocumentos';
import { VisualizadorPDF } from './VisualizadorPDF';
import { notificationService } from '../../../services/shared/notification.service';
import { useDocumentosStore } from '../../../store/documentosStore';
import { useUserInfo } from '../../../hooks/useAuth';
import { exportToCSV } from '../../../utils/export';
import type { Documento, FiltrosDocumentos } from '../types';
import { FILTROS_DEFAULT } from '../types';

const STORAGE_KEY_FILTROS = 'cmo_documentacion_filtros';

export const CentroDocumentacion: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosDocumentos>(() => {
    // Cargar filtros desde localStorage
    const saved = localStorage.getItem(STORAGE_KEY_FILTROS);
    return saved ? JSON.parse(saved) : FILTROS_DEFAULT;
  });
  const [showSubirModal, setShowSubirModal] = useState(false);
  const [documentoVisualizando, setDocumentoVisualizando] = useState<Documento | null>(null);
  
  const { documentos, loading, estadisticas, fetchDocumentos, uploadDocumento, deleteDocumento, updateDocumento } = useDocumentosStore();
  const userInfo = useUserInfo();
  
  const canEdit = userInfo.role === 'admin' || userInfo.role === 'supervisor';
  const canDelete = userInfo.role === 'admin';

  // Cargar documentos al montar
  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILTROS, JSON.stringify(filtros));
  }, [filtros]);

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    // Búsqueda global
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const coincide = doc.descripcion.toLowerCase().includes(busqueda) ||
                      doc.palabrasClave.some(p => p.toLowerCase().includes(busqueda)) ||
                      (doc.numeroDUA && doc.numeroDUA.toLowerCase().includes(busqueda)) ||
                      doc.nombreArchivo.toLowerCase().includes(busqueda);
      if (!coincide) return false;
    }

    // Filtros específicos
    if (filtros.tipo && doc.tipo !== filtros.tipo) return false;
    if (filtros.numeroDUA && !doc.numeroDUA?.includes(filtros.numeroDUA)) return false;
    if (filtros.empresa && doc.empresa !== filtros.empresa) return false;
    
    // Fechas
    if (filtros.fechaDesde && doc.fechaDocumento < filtros.fechaDesde) return false;
    if (filtros.fechaHasta && doc.fechaDocumento > filtros.fechaHasta) return false;
    
    // Estado
    if (filtros.estado !== 'todos' && doc.estado !== filtros.estado) return false;
    
    // Especiales
    if (filtros.soloDestacados && !doc.destacado) return false;
    if (!filtros.incluirConfidenciales && doc.confidencial) return false;

    return true;
  });

  const empresasUnicas = [...new Set(documentos.map(d => d.empresa).filter(Boolean) as string[])];

  const handleSubirDocumento = async (data: any) => {
    try {
      await uploadDocumento(data);
      setShowSubirModal(false);
      notificationService.success('Documento subido', 'El documento se ha guardado correctamente');
    } catch (error) {
      notificationService.error('Error al subir documento', 'Por favor intente nuevamente');
    }
  };

  const handleDescargar = (doc: Documento) => {
    // Simular descarga
    notificationService.info('Descargando...', `Descargando ${doc.nombreArchivo}`);
    
    // Log auditoría
    console.log('Descarga registrada:', {
      documentoId: doc.id,
      usuario: userInfo.name,
      fecha: new Date()
    });
  };

  const handleEliminar = async (doc: Documento) => {
    if (confirm(`¿Está seguro de eliminar "${doc.descripcion}"?`)) {
      try {
        await deleteDocumento(doc.id);
        notificationService.success('Documento eliminado', 'El documento se ha eliminado correctamente');
      } catch (error) {
        notificationService.error('Error al eliminar', 'No se pudo eliminar el documento');
      }
    }
  };

  const handleArchivar = async (doc: Documento) => {
    try {
      await updateDocumento(doc.id, {
        estado: doc.estado === 'archivado' ? 'activo' : 'archivado'
      });
      notificationService.success(
        doc.estado === 'archivado' ? 'Documento desarchivado' : 'Documento archivado',
        'El estado del documento se ha actualizado'
      );
    } catch (error) {
      notificationService.error('Error al actualizar', 'No se pudo cambiar el estado del documento');
    }
  };

  const handleToggleDestacado = async (doc: Documento) => {
    try {
      await updateDocumento(doc.id, {
        destacado: !doc.destacado
      });
    } catch (error) {
      notificationService.error('Error al actualizar', 'No se pudo cambiar el estado destacado');
    }
  };

  const handleExportar = () => {
    const datosExportar = documentosFiltrados.map(doc => ({
      Tipo: doc.tipo,
      'Número DUA': doc.numeroDUA || '-',
      Descripción: doc.descripcion,
      'Fecha Documento': doc.fechaDocumento.toLocaleDateString('es-UY'),
      Empresa: doc.empresa || '-',
      'Subido por': doc.subidoPor.nombre,
      'Fecha Subida': doc.fechaSubida.toLocaleDateString('es-UY'),
      Estado: doc.estado,
      Destacado: doc.destacado ? 'Sí' : 'No',
      Confidencial: doc.confidencial ? 'Sí' : 'No'
    }));

    exportToCSV(datosExportar, `documentos_${new Date().toISOString().split('T')[0]}`);
    notificationService.success('Exportación completada', 'Los documentos se han exportado correctamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Centro de Documentación</h2>
          <p className="text-gray-400 mt-1 text-base sm:text-lg">
            Repositorio centralizado de documentos operativos
          </p>
        </div>
        <button
          onClick={() => setShowSubirModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Subir documento
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total documentos</p>
                  <p className="text-2xl font-bold text-white">{estadisticas.totalDocumentos}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">DUAs</p>
                  <p className="text-2xl font-bold text-white">{estadisticas.porTipo.DUA || 0}</p>
                </div>
                <Badge variant="blue">DUA</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Autorizaciones</p>
                  <p className="text-2xl font-bold text-white">{estadisticas.porTipo.Autorizacion || 0}</p>
                </div>
                <Badge variant="green">AUT</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Este mes</p>
                  <p className="text-2xl font-bold text-white">{estadisticas.documentosMes}</p>
                </div>
                <Upload className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Espacio usado</p>
                  <p className="text-2xl font-bold text-white">
                    {(estadisticas.espacioUsado / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Download className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <FiltrosDocumentosComponent
            filtros={filtros}
            onFiltrosChange={setFiltros}
            empresas={empresasUnicas}
          />
        </CardContent>
      </Card>

      {/* Tabla de documentos */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Documentos ({documentosFiltrados.length})
            </h3>
            {documentosFiltrados.length > 0 && (
              <button
                onClick={handleExportar}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TablaDocumentos
            documentos={documentosFiltrados}
            loading={loading}
            onDescargar={handleDescargar}
            onVisualizar={setDocumentoVisualizando}
            onEliminar={handleEliminar}
            onArchivar={handleArchivar}
            onToggleDestacado={handleToggleDestacado}
            canDelete={canDelete}
            canEdit={canEdit}
          />
        </CardContent>
      </Card>

      {/* Modales */}
      <SubirDocumentoModal
        isOpen={showSubirModal}
        onClose={() => setShowSubirModal(false)}
        onSubmit={handleSubirDocumento}
      />

      <VisualizadorPDF
        documento={documentoVisualizando}
        isOpen={!!documentoVisualizando}
        onClose={() => setDocumentoVisualizando(null)}
        onDescargar={handleDescargar}
      />
    </div>
  );
};