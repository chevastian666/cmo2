import type { StateCreator } from 'zustand';
import type { TransitosStore } from '../types';
import { transitosService } from '../../services';
import { generateMockTransito } from '../../utils/mockData';

export const createTransitosSlice: StateCreator<TransitosStore> = (set, get) => ({
  // State
  transitos: [],
  transitosPendientes: [],
  loading: false,
  error: null,
  lastUpdate: null,

  // Actions
  setTransitos: (transitos) => set({ transitos, lastUpdate: Date.now() }),
  
  setTransitosPendientes: (transitosPendientes) => set({ transitosPendientes, lastUpdate: Date.now() }),
  
  updateTransito: (id, data) => set((state) => ({
    transitos: state.transitos.map(t => t.id === id ? { ...t, ...data } : t),
    transitosPendientes: state.transitosPendientes.map(t => t.id === id ? { ...t, ...data } : t),
  })),
  
  removeTransito: (id) => set((state) => ({
    transitos: state.transitos.filter(t => t.id !== id),
    transitosPendientes: state.transitosPendientes.filter(t => t.id !== id),
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  fetchTransitos: async () => {
    const { setLoading, setError, setTransitos } = get();
    setLoading(true);
    setError(null);
    
    try {
      const data = await transitosService.getAll();
      setTransitos(data);
    } catch (error) {
      // En desarrollo, usar datos mock
      const mockData = Array.from({ length: 20 }, (_, i) => generateMockTransito(i));
      setTransitos(mockData);
      console.warn('Using mock data for transitos:', error);
    } finally {
      setLoading(false);
    }
  },
  
  fetchTransitosPendientes: async () => {
    const { setLoading, setError, setTransitosPendientes } = get();
    setLoading(true);
    setError(null);
    
    try {
      const data = await transitosService.getPendientes();
      setTransitosPendientes(data);
    } catch (error) {
      // En desarrollo, usar datos mock
      const mockData = Array.from({ length: 12 }, (_, i) => generateMockTransito(i));
      setTransitosPendientes(mockData);
      console.warn('Using mock data for transitos pendientes:', error);
    } finally {
      setLoading(false);
    }
  },
  
  precintarTransito: async (transitoId, precintoId) => {
    const { setError, updateTransito } = get();
    setError(null);
    
    try {
      await transitosService.precintar(transitoId, precintoId);
      updateTransito(transitoId, { estado: 'precintado' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al precintar tránsito');
      throw error;
    }
  },
});