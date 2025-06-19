import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FiltrosDocumentosComponent } from './FiltrosDocumentos';
import { TablaDocumentos } from './TablaDocumentos';
import { SubirDocumentoModal } from './SubirDocumentoModal';
import { VisualizadorPDF } from './VisualizadorPDF';
import { useDocumentosStore } from '../../../store/documentosStore';
import { useUserInfo } from '../../../hooks/useAuth';
import { notificationService } from '../../../services/shared/notification.service';
import { exportToCSV } from '../../../utils/export';
import type { Documento, FiltrosDocumentos } from '../types';
import { FILTROS_DEFAULT } from '../types';

const STORAGE_KEY_FILTROS = 'cmo_documentacion_filtros';

export const CentroDocumentacion: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosDocumentos>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILTROS);
      return saved ? JSON.parse(saved) : FILTROS_DEFAULT;
    } catch {
      return FILTROS_DEFAULT;
    }
  });
  const [showSubirModal, setShowSubirModal] = useState(false);
  const [documentoVisualizando, setDocumentoVisualizando] = useState<Documento | null>(null);
  
  const { documentos, loading, estadisticas, fetchDocumentos, uploadDocumento, deleteDocumento } = useDocumentosStore();
  const userInfo = useUserInfo();
  
  const canEdit = userInfo.role === 'admin' || userInfo.role === 'supervisor';
  const canDelete = userInfo.role === 'admin';
  
  console.log('User info:', userInfo);
  console.log('Can edit:', canEdit);
  console.log('Show modal state:', showSubirModal);
  
  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);
  
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
    
    // Fechas - con verificación de tipos
    if (filtros.fechaDesde && doc.fechaDocumento) {
      const fechaDesde = new Date(filtros.fechaDesde);
      const fechaDoc = new Date(doc.fechaDocumento);
      if (fechaDoc < fechaDesde) return false;
    }
    if (filtros.fechaHasta && doc.fechaDocumento) {
      const fechaHasta = new Date(filtros.fechaHasta);
      const fechaDoc = new Date(doc.fechaDocumento);
      if (fechaDoc > fechaHasta) return false;
    }
    
    // Otros filtros
    if (filtros.soloDestacados && !doc.destacado) return false;
    if (filtros.soloConfidenciales && !doc.confidencial) return false;
    
    return true;
  });
  
  // Obtener empresas únicas
  const empresasUnicas = [...new Set(documentos.map(doc => doc.empresa))];
  
  // Handlers
  const handleUpload = async (data: any) => {
    try {
      await uploadDocumento(data);
      notificationService.success('Documento subido', 'El documento se ha guardado correctamente');
      setShowSubirModal(false);
      fetchDocumentos(); // Recargar documentos
    } catch (_error) {
      notificationService.error('Error al subir documento', 'Por favor intente nuevamente');
      throw _error; // Re-throw para que el modal maneje el estado de loading
    }
  };

  const handleDescargar = (doc: Documento) => {
    const downloadUrl = doc.rutaArchivo;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = doc.nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notificationService.success('Descarga iniciada', `Descargando ${doc.nombreArchivo}`);
  };

  const handleEliminar = async (doc: Documento) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${doc.descripcion}"?`)) {
      return;
    }

    try {
      await deleteDocumento(doc.id);
      notificationService.success('Documento eliminado', 'El documento ha sido eliminado correctamente');
    } catch (_error) {
      notificationService.error('Error al eliminar', 'No se pudo eliminar el documento');
    }
  };

  const handleExportar = () => {
    const datosExportar = documentosFiltrados.map(doc => ({
      Tipo: doc.tipo,
      'Número DUA': doc.numeroDUA || '-',
      Descripción: doc.descripcion,
      Empresa: doc.empresa,
      'Fecha Documento': doc.fechaDocumento.toLocaleDateString('es-UY'),
      'Palabras Clave': doc.palabrasClave.join(', '),
      'Nombre Archivo': doc.nombreArchivo,
      'Tamaño': `${Math.round(doc.tamanioArchivo / 1024)} KB`,
      'Subido por': doc.subidoPor.nombre,
      'Fecha Subida': doc.fechaSubida.toLocaleDateString('es-UY'),
      Estado: doc.estado,
      Destacado: doc.destacado ? 'Sí' : 'No',
      Confidencial: doc.confidencial ? 'Sí' : 'No'
    }));

    exportToCSV(datosExportar, `documentos_${new Date().toISOString().split('T')[0]}`);
    notificationService.success('Exportación completada', 'Los documentos se han exportado correctamente');
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-white">Cargando documentos...</p>
      </div>
    );
  }
  
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
        <div className="flex gap-2">
          {documentosFiltrados.length > 0 && (
            <button
              onClick={handleExportar}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Exportar
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => {
                console.log('Button clicked, setting showSubirModal to true');
                setShowSubirModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Subir documento
            </button>
          )}
        </div>
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
                  <p className="text-2xl font-bold text-white">{estadisticas.porTipo?.DUA || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Autorizaciones</p>
                  <p className="text-2xl font-bold text-white">{estadisticas.porTipo?.Autorizacion || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-500 opacity-50" />
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
                <FileText className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Espacio usado</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(estadisticas.espacioUsado / 1024 / 1024)} MB
                  </p>
                </div>
                <Download className="h-8 w-8 text-orange-500 opacity-50" />
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TablaDocumentos
            documentos={documentosFiltrados}
            onDescargar={handleDescargar}
            onVisualizar={setDocumentoVisualizando}
            onEliminar={canDelete ? handleEliminar : undefined}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modales */}
      {showSubirModal && (
        <SubirDocumentoModal
          isOpen={showSubirModal}
          onClose={() => {
            console.log('Modal closing');
            setShowSubirModal(false);
          }}
          onSubmit={handleUpload}
        />
      )}

      {documentoVisualizando && (
        <VisualizadorPDF
          documento={documentoVisualizando}
          onClose={() => setDocumentoVisualizando(null)}
        />
      )}
    </div>
  );
};