import { useEffect } from 'react';
import { usePrecintosStore } from '../store';

export const usePrecintos = () => {
  const store = usePrecintosStore();
  
  useEffect(() => {
    // Fetch data on mount if not already loaded
    if (store.precintos.length === 0 && !store.loading) {
      store.fetchPrecintos();
    }
  }, []);

  return {
    precintos: store.precintos,
    loading: store.loading,
    error: store.error,
    actions: {
      updatePrecinto: store.updatePrecinto,
      removePrecinto: store.removePrecinto,
      refresh: store.fetchPrecintos,
    }
  };
};

export const usePrecintosActivos = () => {
  const store = usePrecintosStore();
  
  useEffect(() => {
    // Fetch data on mount if not already loaded
    if (store.precintosActivos.length === 0 && !store.loading) {
      store.fetchPrecintosActivos();
    }
  }, []);

  return {
    precintos: store.precintosActivos,
    loading: store.loading,
    error: store.error,
    actions: {
      updatePrecinto: store.updatePrecinto,
      refresh: store.fetchPrecintosActivos,
    }
  };
};

export const usePrecinto = (id: string) => {
  const precintos = usePrecintosStore((state) => state.precintos);
  const precinto = precintos.find((p) => p.id === id);
  
  return {
    precinto,
    found: !!precinto,
  };
};