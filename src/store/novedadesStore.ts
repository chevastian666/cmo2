import { create } from 'zustand';
import type { Novedad, EstadisticasNovedades } from '../features/novedades/types';

// Mock data para desarrollo
const mockNovedades: Novedad[] = [
  {
    id: '1',
    fecha: new Date(),
    fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
    puntoOperacion: 'TCP',
    tipoNovedad: 'evento',
    descripcion: 'Se completó la inspección de rutina del turno matutino. Todo en orden, sin novedades que reportar. Se verificaron todos los puntos de control.',
    estado: 'activa',
    creadoPor: {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan.perez@blocktracker.com',
      rol: 'encargado'
    }
  },
  {
    id: '2',
    fecha: new Date(),
    fechaCreacion: new Date(Date.now() - 3 * 60 * 60 * 1000),
    puntoOperacion: 'Montecon',
    tipoNovedad: 'reclamo',
    descripcion: 'Demora excesiva en el procesamiento de contenedores. El sistema está funcionando más lento de lo habitual. Se requiere revisión técnica urgente.',
    estado: 'seguimiento',
    creadoPor: {
      id: '2',
      nombre: 'María García',
      email: 'maria.garcia@blocktracker.com',
      rol: 'encargado'
    },
    seguimientos: [
      {
        id: 's1',
        fecha: new Date(Date.now() - 1 * 60 * 60 * 1000),
        usuario: {
          id: '3',
          nombre: 'Carlos López'
        },
        comentario: 'Se contactó al equipo técnico. Están en camino para revisar el sistema.'
      }
    ]
  },
  {
    id: '3',
    fecha: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
    fechaCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000),
    puntoOperacion: 'Rivera',
    tipoNovedad: 'tarea',
    descripcion: 'Cambio de turno realizado sin inconvenientes. Se entregó inventario completo al turno entrante.',
    estado: 'resuelta',
    creadoPor: {
      id: '4',
      nombre: 'Ana Rodríguez',
      email: 'ana.rodriguez@blocktracker.com',
      rol: 'encargado'
    },
    resolucion: {
      fecha: new Date(Date.now() - 20 * 60 * 60 * 1000),
      usuario: {
        id: '4',
        nombre: 'Ana Rodríguez'
      },
      comentario: 'Turno completado exitosamente'
    }
  },
  {
    id: '4',
    fecha: new Date(),
    fechaCreacion: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 min
    puntoOperacion: 'TCP',
    tipoNovedad: 'pendiente',
    descripcion: 'Pendiente coordinar con Aduana la inspección especial programada para mañana. Necesitamos confirmar horario y personal asignado.',
    estado: 'activa',
    archivosAdjuntos: [
      {
        id: 'a1',
        nombre: 'solicitud_inspeccion.pdf',
        tipo: 'pdf',
        url: '/docs/solicitud_inspeccion.pdf',
        tamanio: 245678
      }
    ],
    creadoPor: {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan.perez@blocktracker.com',
      rol: 'encargado'
    }
  },
  {
    id: '5',
    fecha: new Date(),
    fechaCreacion: new Date(Date.now() - 45 * 60 * 1000),
    puntoOperacion: 'CMO Central',
    tipoNovedad: 'aviso',
    descripcion: 'Recordatorio: Mañana se realizará mantenimiento preventivo del sistema entre las 14:00 y 16:00 horas. Favor coordinar operaciones.',
    estado: 'activa',
    creadoPor: {
      id: '5',
      nombre: 'Sistema CMO',
      email: 'sistema@blocktracker.com',
      rol: 'admin'
    }
  }
];

interface NovedadesState {
  novedades: Novedad[];
  estadisticas: EstadisticasNovedades | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNovedades: (filtros?: any) => Promise<void>;
  crearNovedad: (data: any) => Promise<void>;
  editarNovedad: (id: string, data: any) => Promise<void>;
  marcarResuelta: (id: string, comentario?: string) => Promise<void>;
  agregarSeguimiento: (id: string, comentario: string) => Promise<void>;
  calcularEstadisticas: () => void;
}

export const useNovedadesStore = create<NovedadesState>((set, get) => ({
  novedades: [],
  estadisticas: null,
  loading: false,
  error: null,

  fetchNovedades: async (filtros) => {
    set({ loading: true });
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let novedadesFiltradas = [...mockNovedades];
      
      // Aplicar filtros si existen
      if (filtros) {
        if (filtros.fecha) {
          novedadesFiltradas = novedadesFiltradas.filter(n => 
            n.fecha.toDateString() === filtros.fecha.toDateString()
          );
        }
        if (filtros.puntoOperacion) {
          novedadesFiltradas = novedadesFiltradas.filter(n => 
            n.puntoOperacion === filtros.puntoOperacion
          );
        }
        // ... más filtros
      }
      
      set({ novedades: novedadesFiltradas, loading: false });
      get().calcularEstadisticas();
    } catch (error) {
      set({ error: 'Error al cargar novedades', loading: false });
    }
  },

  crearNovedad: async (data) => {
    try {
      const nuevaNovedad: Novedad = {
        id: Date.now().toString(),
        fecha: new Date(data.fecha),
        fechaCreacion: new Date(),
        puntoOperacion: data.puntoOperacion,
        tipoNovedad: data.tipoNovedad,
        descripcion: data.descripcion,
        estado: 'activa',
        creadoPor: {
          id: '1',
          nombre: 'Usuario Actual',
          email: 'usuario@blocktracker.com',
          rol: 'encargado'
        }
      };

      const { novedades } = get();
      set({ novedades: [nuevaNovedad, ...novedades] });
      get().calcularEstadisticas();
    } catch (error) {
      throw new Error('Error al crear novedad');
    }
  },

  editarNovedad: async (id, data) => {
    try {
      const { novedades } = get();
      set({
        novedades: novedades.map(n => 
          n.id === id 
            ? { 
                ...n, 
                ...data,
                editadoPor: {
                  id: '1',
                  nombre: 'Usuario Actual',
                  fecha: new Date()
                }
              }
            : n
        )
      });
    } catch (error) {
      throw new Error('Error al editar novedad');
    }
  },

  marcarResuelta: async (id, comentario) => {
    try {
      const { novedades } = get();
      set({
        novedades: novedades.map(n => 
          n.id === id 
            ? { 
                ...n, 
                estado: 'resuelta' as const,
                resolucion: {
                  fecha: new Date(),
                  usuario: {
                    id: '1',
                    nombre: 'Usuario Actual'
                  },
                  comentario
                }
              }
            : n
        )
      });
      get().calcularEstadisticas();
    } catch (error) {
      throw new Error('Error al marcar como resuelta');
    }
  },

  agregarSeguimiento: async (id, comentario) => {
    try {
      const { novedades } = get();
      const nuevoSeguimiento = {
        id: Date.now().toString(),
        fecha: new Date(),
        usuario: {
          id: '1',
          nombre: 'Usuario Actual'
        },
        comentario
      };

      set({
        novedades: novedades.map(n => 
          n.id === id 
            ? { 
                ...n, 
                estado: 'seguimiento' as const,
                seguimientos: [...(n.seguimientos || []), nuevoSeguimiento]
              }
            : n
        )
      });
    } catch (error) {
      throw new Error('Error al agregar seguimiento');
    }
  },

  calcularEstadisticas: () => {
    const { novedades } = get();
    const hoy = new Date();
    const novedadesHoy = novedades.filter(n => 
      n.fecha.toDateString() === hoy.toDateString()
    );

    const estadisticas: EstadisticasNovedades = {
      totalDia: novedadesHoy.length,
      porTipo: novedadesHoy.reduce((acc, n) => {
        acc[n.tipoNovedad] = (acc[n.tipoNovedad] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      porPunto: novedadesHoy.reduce((acc, n) => {
        acc[n.puntoOperacion] = (acc[n.puntoOperacion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      pendientes: novedades.filter(n => n.estado === 'activa').length,
      resueltas: novedades.filter(n => n.estado === 'resuelta').length,
      enSeguimiento: novedades.filter(n => n.estado === 'seguimiento').length
    };

    set({ estadisticas });
  }
}));