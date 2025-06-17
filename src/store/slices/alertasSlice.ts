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
  filter: {},

  // Actions
  setAlertas: (alertas) => set({ alertas, lastUpdate: Date.now() }),
  
  setAlertasActivas: (alertasActivas) => set({ alertasActivas, lastUpdate: Date.now() }),
  
  addAlerta: (alerta) => set((state) => ({
    alertas: [...state.alertas, alerta],
    alertasActivas: alerta.atendida ? state.alertasActivas : [...state.alertasActivas, alerta],
  })),
  
  updateAlerta: (id, data) => set((state) => ({
    alertas: state.alertas.map(a => a.id === id ? { ...a, ...data } : a),
    alertasActivas: state.alertasActivas.map(a => a.id === id ? { ...a, ...data } : a),
  })),
  
  removeAlerta: (id) => set((state) => ({
    alertas: state.alertas.filter(a => a.id !== id),
    alertasActivas: state.alertasActivas.filter(a => a.id !== id),
  })),
  
  atenderAlerta: async (id) => {
    const { setError, updateAlerta, alertasActivas } = get();
    setError(null);
    
    try {
      await alertasService.atender(id);
      updateAlerta(id, { atendida: true });
      // Remove from active alerts
      set({ alertasActivas: alertasActivas.filter(a => a.id !== id) });
    } catch (error) {
      // En desarrollo, simular atención
      updateAlerta(id, { atendida: true });
      set({ alertasActivas: alertasActivas.filter(a => a.id !== id) });
      console.warn('Simulating alert attention:', error);
    }
  },
  
  setFilter: (filter) => set({ filter }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  fetchAlertas: async () => {
    const { setLoading, setError, setAlertas, filter } = get();
    setLoading(true);
    setError(null);
    
    try {
      const data = await alertasService.getAll(filter);
      setAlertas(data);
    } catch (error) {
      // En desarrollo, usar datos mock
      const mockData = generateMockAlertas();
      setAlertas(mockData);
      console.warn('Using mock data for alertas:', error);
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
    } catch (error) {
      // En desarrollo, usar datos mock
      const mockData = generateMockAlertas().filter(a => !a.atendida);
      setAlertasActivas(mockData);
      console.warn('Using mock data for alertas activas:', error);
    } finally {
      setLoading(false);
    }
  },

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
      
    } catch (error) {
      console.error('Error asignando alerta:', error);
      throw error;
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
      
    } catch (error) {
      console.error('Error agregando comentario:', error);
      throw error;
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
      
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
      throw error;
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