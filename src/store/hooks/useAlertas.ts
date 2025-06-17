import { useEffect, useState } from 'react';
import { useAlertasStore } from '../store';
import type { AlertaExtendida } from '../../types';

export const useAlertas = () => {
  const store = useAlertasStore();
  
  useEffect(() => {
    // Fetch data on mount if not already loaded
    if (store.alertas.length === 0 && !store.loading) {
      store.fetchAlertas();
    }
  }, []);

  return {
    alertas: store.alertas,
    loading: store.loading,
    error: store.error,
    filter: store.filter,
    actions: {
      addAlerta: store.addAlerta,
      updateAlerta: store.updateAlerta,
      removeAlerta: store.removeAlerta,
      atenderAlerta: store.atenderAlerta,
      setFilter: store.setFilter,
      refresh: store.fetchAlertas,
    }
  };
};

export const useAlertasActivas = () => {
  const store = useAlertasStore();
  
  useEffect(() => {
    // Fetch data on mount if not already loaded
    if (store.alertasActivas.length === 0 && !store.loading) {
      store.fetchAlertasActivas();
    }
  }, []);

  return {
    alertas: store.alertasActivas,
    loading: store.loading,
    error: store.error,
    count: store.alertasActivas.length,
    actions: {
      atenderAlerta: store.atenderAlerta,
      refresh: store.fetchAlertasActivas,
      asignarAlerta: store.asignarAlerta,
      comentarAlerta: store.comentarAlerta,
      resolverAlerta: store.resolverAlerta,
    }
  };
};

export const useAlerta = (id: string) => {
  const alertas = useAlertasStore((state) => state.alertas);
  const alerta = alertas.find((a) => a.id === id);
  
  return {
    alerta,
    found: !!alerta,
  };
};

export const useAlertaExtendida = (id: string) => {
  const store = useAlertasStore();
  const [alertaExtendida, setAlertaExtendida] = useState<AlertaExtendida | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAlerta = async () => {
      setLoading(true);
      try {
        const data = await store.fetchAlertaExtendida(id);
        setAlertaExtendida(data);
      } catch (error) {
        console.error('Error fetching extended alert:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchAlerta();
    }
  }, [id]);
  
  // Subscribe to updates
  useEffect(() => {
    const unsubscribe = useAlertasStore.subscribe((state) => {
      const updated = state.alertasExtendidas.get(id);
      if (updated && updated !== alertaExtendida) {
        setAlertaExtendida(updated);
      }
    });
    
    return unsubscribe;
  }, [id, alertaExtendida]);
  
  return {
    alerta: alertaExtendida,
    loading,
    actions: {
      asignar: (usuarioId: string, notas?: string) => store.asignarAlerta(id, usuarioId, notas),
      comentar: (mensaje: string) => store.comentarAlerta(id, mensaje),
      resolver: (tipo: string, descripcion: string, acciones?: string[]) => 
        store.resolverAlerta(id, tipo, descripcion, acciones),
      refresh: async () => {
        const data = await store.fetchAlertaExtendida(id);
        setAlertaExtendida(data);
      }
    }
  };
};