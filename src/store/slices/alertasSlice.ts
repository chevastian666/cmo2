/**
 * Alertas Store Slice with Enhanced Zustand Patterns
 * Includes: Immer integration, computed properties, batch operations
 * By Cheva
 */

import type { StateCreator } from 'zustand';
import type { AlertasStore } from '../types';
import type { AlertaExtendida, ComentarioAlerta, AsignacionAlerta, ResolucionAlerta, HistorialAlerta } from '../../types';
import { alertasService } from '../../services';
import { generateMockAlertas } from '../../utils/mockData';
import { usuariosService } from '../../services/usuarios.service';

export const createAlertasSlice: StateCreator<AlertasStore> = (set, get) => ({
  // State
  alertas: [],
  alertasActivas: [],
  alertasExtendidas: new Map(),
  loading: false,
  error: null,
  lastUpdate: null,
  filter: {
    search: ''
  },

  // Computed Properties (getters)
  get filteredAlertas() {
    const { alertas, filter } = get();
    let filtered = [...alertas];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.tipo.toLowerCase().includes(searchLower) ||
        a.descripcion?.toLowerCase().includes(searchLower) ||
        a.dua?.toLowerCase().includes(searchLower)
      );
    }

    if (filter.tipo) {
      filtered = filtered.filter(a => a.tipo === filter.tipo);
    }

    if (filter.severidad) {
      filtered = filtered.filter(a => a.severidad === filter.severidad);
    }

    if (filter.atendida !== undefined) {
      filtered = filtered.filter(a => a.atendida === filter.atendida);
    }

    if (filter.estado) {
      switch (filter.estado) {
        case 'activas':
          filtered = filtered.filter(a => !a.atendida);
          break;
        case 'asignadas':
          const asignadas = Array.from(get().alertasExtendidas.values())
            .filter(ext => ext.asignacion)
            .map(ext => ext.id);
          filtered = filtered.filter(a => asignadas.includes(a.id));
          break;
        case 'resueltas':
          const resueltas = Array.from(get().alertasExtendidas.values())
            .filter(ext => ext.resolucion)
            .map(ext => ext.id);
          filtered = filtered.filter(a => resueltas.includes(a.id));
          break;
      }
    }

    return filtered;
  },

  get alertasStats() {
    const { alertas, alertasExtendidas } = get();
    const extendedMap = new Map(alertasExtendidas);
    
    return {
      total: alertas.length,
      criticas: alertas.filter(a => a.severidad === 'critica').length,
      altas: alertas.filter(a => a.severidad === 'alta').length,
      medias: alertas.filter(a => a.severidad === 'media').length,
      bajas: alertas.filter(a => a.severidad === 'baja').length,
      sinAtender: alertas.filter(a => !a.atendida).length,
      asignadas: Array.from(extendedMap.values()).filter(ext => ext.asignacion).length,
      resueltas: Array.from(extendedMap.values()).filter(ext => ext.resolucion).length
    };
  },

  get alertasCriticas() {
    const { alertasActivas } = get();
    return alertasActivas.filter(a => a.severidad === 'critica');
  },

  get alertasPorTipo() {
    const { alertas } = get();
    const tipoMap = new Map<string, typeof alertas>();
    
    alertas.forEach(alerta => {
      const tipo = alerta.tipo;
      if (!tipoMap.has(tipo)) {
        tipoMap.set(tipo, []);
      }
      tipoMap.get(tipo)!.push(alerta);
    });
    
    return tipoMap;
  },

  // Actions with Immer patterns
  setAlertas: (alertas) => set((state) => {
    state.alertas = alertas;
    state.lastUpdate = Date.now();
    state.error = null;
  }),
  
  setAlertasActivas: (alertasActivas) => set((state) => {
    state.alertasActivas = alertasActivas;
    state.lastUpdate = Date.now();
    state.error = null;
  }),
  
  addAlerta: (alerta) => set((state) => {
    state.alertas.push(alerta);
    if (!alerta.atendida) {
      state.alertasActivas.push(alerta);
    }
    state.lastUpdate = Date.now();
  }),
  
  updateAlerta: (id, data) => set((state) => {
    const updateItem = (item: any) => item.id === id ? { ...item, ...data } : item;
    state.alertas = state.alertas.map(updateItem);
    state.alertasActivas = state.alertasActivas.map(updateItem);
    state.lastUpdate = Date.now();
  }),
  
  removeAlerta: (id) => set((state) => {
    state.alertas = state.alertas.filter(a => a.id !== id);
    state.alertasActivas = state.alertasActivas.filter(a => a.id !== id);
    state.lastUpdate = Date.now();
  }),
  
  atenderAlerta: async (id) => {
    const { setError, updateAlerta, alertasActivas } = get();
    setError(null);
    
    try {
      await alertasService.atender(id);
      updateAlerta(id, { atendida: true });
      // Remove from active alerts
      set((state) => {
        state.alertasActivas = state.alertasActivas.filter(a => a.id !== id);
      });
    } catch (_error) {
      // En desarrollo, simular atención
      updateAlerta(id, { atendida: true });
      set((state) => {
        state.alertasActivas = state.alertasActivas.filter(a => a.id !== id);
      });
      console.warn('Simulating alert attention:', _error);
    }
  },
  
  setFilter: (filter) => set((state) => {
    state.filter = { ...state.filter, ...filter };
  }),

  clearFilter: () => set((state) => {
    state.filter = { search: '' };
  }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  fetchAlertas: async () => {
    const { setLoading, setError, setAlertas, filter } = get();
    setLoading(true);
    setError(null);
    
    try {
      const data = await alertasService.getAll(filter);
      setAlertas(data);
      return data;
    } catch (_error) {
      // En desarrollo, usar datos mock
      const mockData = generateMockAlertas();
      setAlertas(mockData);
      console.warn('Using mock data for alertas:', _error);
      return mockData;
    } finally {
      setLoading(false);
    }
  },
  
  fetchAlertasActivas: async () => {
    const { setLoading, setError, setAlertasActivas } = get();
    setLoading(true);
    setError(null);
    
    try {
      const data = await alertasService.getActivas();
      setAlertasActivas(data);
      return data;
    } catch (_error) {
      // En desarrollo, usar datos mock
      const mockData = generateMockAlertas().filter(a => !a.atendida);
      setAlertasActivas(mockData);
      console.warn('Using mock data for alertas activas:', _error);
      return mockData;
    } finally {
      setLoading(false);
    }
  },

  // Batch operations
  batchUpdateAlertas: (updates) => set((state) => {
    updates.forEach(({ id, data }) => {
      const index = state.alertas.findIndex(a => a.id === id);
      if (index !== -1) {
        state.alertas[index] = { ...state.alertas[index], ...data };
      }
      
      const activeIndex = state.alertasActivas.findIndex(a => a.id === id);
      if (activeIndex !== -1) {
        state.alertasActivas[activeIndex] = { ...state.alertasActivas[activeIndex], ...data };
      }
    });
    state.lastUpdate = Date.now();
  }),

  batchAtenderAlertas: async (ids) => {
    const { batchUpdateAlertas, setAlertasActivas, alertasActivas } = get();
    
    try {
      // In production, this would be a batch API call
      await Promise.all(ids.map(id => alertasService.atender(id)));
      
      // Update all alerts as attended
      batchUpdateAlertas(ids.map(id => ({ id, data: { atendida: true } })));
      
      // Remove from active alerts
      setAlertasActivas(alertasActivas.filter(a => !ids.includes(a.id)));
    } catch (_error) {
      console.error('Error batch attending alerts:', _error);
      // Still update in development
      batchUpdateAlertas(ids.map(id => ({ id, data: { atendida: true } })));
      setAlertasActivas(alertasActivas.filter(a => !ids.includes(a.id)));
    }
  },

  // Reset store
  reset: () => set((state) => {
    state.alertas = [];
    state.alertasActivas = [];
    state.alertasExtendidas = new Map();
    state.loading = false;
    state.error = null;
    state.lastUpdate = null;
    state.filter = { search: '' };
  }),

  // Extended alert management
  fetchAlertaExtendida: async (id: string): Promise<AlertaExtendida | null> => {
    const { alertasExtendidas, alertas } = get();
    
    // Check cache first
    if (alertasExtendidas.has(id)) {
      return alertasExtendidas.get(id)!;
    }
    
    // Find base alert
    const baseAlerta = alertas.find(a => a.id === id);
    if (!baseAlerta) return null;
    
    // Create extended alert with mock data for now
    const currentUser = await usuariosService.getCurrentUser();
    const extendedAlerta: AlertaExtendida = {
      ...baseAlerta,
      comentarios: [],
      historial: [
        {
          id: `hist-${Date.now()}`,
          alertaId: id,
          tipo: 'creada',
          timestamp: baseAlerta.timestamp,
          detalles: { mensaje: 'Alerta creada' }
        }
      ],
      tiempoRespuesta: undefined,
      tiempoResolucion: undefined
    };
    
    // Cache it
    set((state) => {
      const newMap = new Map(state.alertasExtendidas);
      newMap.set(id, extendedAlerta);
      return { alertasExtendidas: newMap };
    });
    
    return extendedAlerta;
  },

  asignarAlerta: async (alertaId: string, usuarioId: string, notas?: string) => {
    const { alertasExtendidas, updateAlertaExtendida } = get();
    
    try {
      // Get users
      const [usuario, currentUser] = await Promise.all([
        usuariosService.getById(usuarioId),
        usuariosService.getCurrentUser()
      ]);
      
      if (!usuario) throw new Error('Usuario no encontrado');
      
      const alertaExtendida = await get().fetchAlertaExtendida(alertaId);
      if (!alertaExtendida) throw new Error('Alerta no encontrada');
      
      const asignacion: AsignacionAlerta = {
        id: `asig-${Date.now()}`,
        alertaId,
        usuarioAsignadoId: usuarioId,
        usuarioAsignado: usuario,
        asignadoPorId: currentUser.id,
        asignadoPor: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        notas
      };
      
      const historialEntry: HistorialAlerta = {
        id: `hist-${Date.now()}`,
        alertaId,
        tipo: 'asignada',
        usuarioId: currentUser.id,
        usuario: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        detalles: { asignadoA: usuario.nombre, notas }
      };
      
      updateAlertaExtendida(alertaId, {
        asignacion,
        historial: [...alertaExtendida.historial, historialEntry],
        tiempoRespuesta: alertaExtendida.tiempoRespuesta || (Math.floor(Date.now() / 1000) - alertaExtendida.timestamp)
      });
      
      // Update base alert
      get().updateAlerta(alertaId, { atendida: true });
      
    } catch (_error) {
      console.error('Error asignando alerta:', _error);
      throw _error;
    }
  },

  comentarAlerta: async (alertaId: string, mensaje: string) => {
    const { updateAlertaExtendida } = get();
    
    try {
      const currentUser = await usuariosService.getCurrentUser();
      const alertaExtendida = await get().fetchAlertaExtendida(alertaId);
      if (!alertaExtendida) throw new Error('Alerta no encontrada');
      
      const comentario: ComentarioAlerta = {
        id: `com-${Date.now()}`,
        alertaId,
        usuarioId: currentUser.id,
        usuario: currentUser,
        mensaje,
        timestamp: Math.floor(Date.now() / 1000),
        tipo: 'comentario'
      };
      
      const historialEntry: HistorialAlerta = {
        id: `hist-${Date.now()}`,
        alertaId,
        tipo: 'comentario',
        usuarioId: currentUser.id,
        usuario: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        detalles: { mensaje }
      };
      
      updateAlertaExtendida(alertaId, {
        comentarios: [...alertaExtendida.comentarios, comentario],
        historial: [...alertaExtendida.historial, historialEntry]
      });
      
    } catch (_error) {
      console.error('Error agregando comentario:', _error);
      throw _error;
    }
  },

  resolverAlerta: async (alertaId: string, tipo: string, descripcion: string, acciones?: string[]) => {
    const { updateAlertaExtendida, setAlertasActivas, alertasActivas } = get();
    
    try {
      const currentUser = await usuariosService.getCurrentUser();
      const alertaExtendida = await get().fetchAlertaExtendida(alertaId);
      if (!alertaExtendida) throw new Error('Alerta no encontrada');
      
      const resolucion: ResolucionAlerta = {
        id: `res-${Date.now()}`,
        alertaId,
        resueltoPorId: currentUser.id,
        resueltoPor: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        tipoResolucion: tipo as any,
        descripcion,
        accionesTomadas: acciones
      };
      
      const historialEntry: HistorialAlerta = {
        id: `hist-${Date.now()}`,
        alertaId,
        tipo: 'resuelta',
        usuarioId: currentUser.id,
        usuario: currentUser,
        timestamp: Math.floor(Date.now() / 1000),
        detalles: { tipoResolucion: tipo, descripcion, acciones }
      };
      
      updateAlertaExtendida(alertaId, {
        resolucion,
        historial: [...alertaExtendida.historial, historialEntry],
        tiempoResolucion: Math.floor(Date.now() / 1000) - alertaExtendida.timestamp
      });
      
      // Update base alert and remove from active
      get().updateAlerta(alertaId, { atendida: true });
      setAlertasActivas(alertasActivas.filter(a => a.id !== alertaId));
      
    } catch (_error) {
      console.error('Error resolviendo alerta:', _error);
      throw _error;
    }
  },

  updateAlertaExtendida: (id: string, data: Partial<AlertaExtendida>) => {
    set((state) => {
      const newMap = new Map(state.alertasExtendidas);
      const current = newMap.get(id);
      if (current) {
        newMap.set(id, { ...current, ...data });
      }
      return { alertasExtendidas: newMap };
    });
  },
});