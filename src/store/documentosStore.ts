import { create } from 'zustand';
import type { Documento, EstadisticasDocumentacion, LogAuditoria } from '../features/documentacion/types';

// Mock data para desarrollo
const mockDocumentos: Documento[] = [
  {
    id: '1',
    tipo: 'DUA',
    numeroDUA: '2024/123456',
    fechaDocumento: new Date('2024-01-15'),
    fechaSubida: new Date('2024-01-16'),
    descripcion: 'DUA de importación contenedor MSKU7234561',
    palabrasClave: ['importación', 'contenedor', 'TCP'],
    nombreArchivo: 'DUA_2024_123456.pdf',
    tamanioArchivo: 2548763,
    rutaArchivo: '/docs/DUA_2024_123456.pdf',
    empresa: 'Importadora ABC S.A.',
    destacado: true,
    confidencial: false,
    subidoPor: {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan.perez@blocktracker.com'
    },
    estado: 'activo'
  },
  {
    id: '2',
    tipo: 'Autorizacion',
    fechaDocumento: new Date('2024-01-10'),
    fechaSubida: new Date('2024-01-10'),
    descripcion: 'Autorización de tránsito especial - Carga sobredimensionada',
    palabrasClave: ['autorización', 'tránsito', 'sobredimensionada'],
    nombreArchivo: 'Autorizacion_transito_especial.pdf',
    tamanioArchivo: 1234567,
    rutaArchivo: '/docs/Autorizacion_transito_especial.pdf',
    empresa: 'Transportes Unidos',
    destacado: false,
    confidencial: true,
    subidoPor: {
      id: '2',
      nombre: 'María García',
      email: 'maria.garcia@blocktracker.com'
    },
    estado: 'activo'
  },
  {
    id: '3',
    tipo: 'Comunicacion',
    fechaDocumento: new Date('2024-01-12'),
    fechaSubida: new Date('2024-01-12'),
    descripcion: 'Comunicación DNA - Nuevos procedimientos operativos',
    palabrasClave: ['DNA', 'procedimientos', 'operativos'],
    nombreArchivo: 'Comunicacion_DNA_procedimientos.pdf',
    tamanioArchivo: 3456789,
    rutaArchivo: '/docs/Comunicacion_DNA_procedimientos.pdf',
    destacado: true,
    confidencial: false,
    subidoPor: {
      id: '3',
      nombre: 'Carlos López',
      email: 'carlos.lopez@blocktracker.com'
    },
    estado: 'activo'
  }
];

interface DocumentosState {
  documentos: Documento[];
  estadisticas: EstadisticasDocumentacion | null;
  loading: boolean;
  error: string | null;
  logs: LogAuditoria[];
  
  // Actions
  fetchDocumentos: () => Promise<void>;
  uploadDocumento: (data: any) => Promise<void>;
  deleteDocumento: (id: string) => Promise<void>;
  updateDocumento: (id: string, updates: Partial<Documento>) => Promise<void>;
  registrarLog: (log: Omit<LogAuditoria, 'id' | 'fecha'>) => void;
}

export const useDocumentosStore = create<DocumentosState>((set, get) => ({
  documentos: [],
  estadisticas: null,
  loading: false,
  error: null,
  logs: [],

  fetchDocumentos: async () => {
    set({ loading: true });
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calcular estadísticas
      const estadisticas: EstadisticasDocumentacion = {
        totalDocumentos: mockDocumentos.length,
        porTipo: mockDocumentos.reduce((acc, doc) => {
          acc[doc.tipo] = (acc[doc.tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        espacioUsado: mockDocumentos.reduce((acc, doc) => acc + doc.tamanioArchivo, 0),
        documentosMes: mockDocumentos.filter(doc => {
          const mesActual = new Date().getMonth();
          return doc.fechaSubida.getMonth() === mesActual;
        }).length,
        ultimaActualizacion: new Date()
      };

      set({ 
        documentos: mockDocumentos, 
        estadisticas,
        loading: false,
        error: null
      });
    } catch (error) {
      set({ 
        error: 'Error al cargar documentos',
        loading: false
      });
    }
  },

  uploadDocumento: async (data) => {
    try {
      // Simular subida
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nuevoDoc: Documento = {
        id: Date.now().toString(),
        tipo: data.tipo,
        numeroDUA: data.numeroDUA,
        fechaDocumento: new Date(data.fechaDocumento),
        fechaSubida: new Date(),
        descripcion: data.descripcion,
        palabrasClave: data.palabrasClave ? data.palabrasClave.split(',').map((p: string) => p.trim()) : [],
        nombreArchivo: data.archivo.name,
        tamanioArchivo: data.archivo.size,
        rutaArchivo: `/docs/${data.archivo.name}`,
        empresa: data.empresa,
        destacado: data.destacado,
        confidencial: data.confidencial,
        subidoPor: {
          id: '1',
          nombre: 'Usuario Actual',
          email: 'usuario@blocktracker.com'
        },
        estado: 'activo'
      };

      const { documentos } = get();
      set({ documentos: [...documentos, nuevoDoc] });
      
      // Registrar log
      get().registrarLog({
        documentoId: nuevoDoc.id,
        accion: 'subida',
        usuarioId: '1',
        usuarioNombre: 'Usuario Actual',
        ip: '192.168.1.1'
      });
    } catch (error) {
      throw new Error('Error al subir documento');
    }
  },

  deleteDocumento: async (id) => {
    try {
      const { documentos } = get();
      set({ documentos: documentos.filter(d => d.id !== id) });
      
      // Registrar log
      get().registrarLog({
        documentoId: id,
        accion: 'eliminacion',
        usuarioId: '1',
        usuarioNombre: 'Usuario Actual',
        ip: '192.168.1.1'
      });
    } catch (error) {
      throw new Error('Error al eliminar documento');
    }
  },

  updateDocumento: async (id, updates) => {
    try {
      const { documentos } = get();
      set({
        documentos: documentos.map(d => 
          d.id === id 
            ? { 
                ...d, 
                ...updates,
                ultimaModificacion: new Date(),
                modificadoPor: {
                  id: '1',
                  nombre: 'Usuario Actual'
                }
              }
            : d
        )
      });
      
      // Registrar log
      get().registrarLog({
        documentoId: id,
        accion: 'modificacion',
        usuarioId: '1',
        usuarioNombre: 'Usuario Actual',
        ip: '192.168.1.1',
        detalles: JSON.stringify(updates)
      });
    } catch (error) {
      throw new Error('Error al actualizar documento');
    }
  },

  registrarLog: (log) => {
    const nuevoLog: LogAuditoria = {
      ...log,
      id: Date.now().toString(),
      fecha: new Date()
    };
    
    set(state => ({
      logs: [...state.logs, nuevoLog]
    }));
  }
}));