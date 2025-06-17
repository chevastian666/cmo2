import { useEffect } from 'react';
import { useTransitosStore } from '../store';

export const useTransitos = () => {
  const store = useTransitosStore();
  
  useEffect(() => {
    // Fetch data on mount if not already loaded
    if (store.transitos.length === 0 && !store.loading) {
      store.fetchTransitos();
    }
  }, []);

  return {
    transitos: store.transitos,
    loading: store.loading,
    error: store.error,
    actions: {
      updateTransito: store.updateTransito,
      removeTransito: store.removeTransito,
      refresh: store.fetchTransitos,
    }
  };
};

export const useTransitosPendientes = () => {
  const store = useTransitosStore();
  
  useEffect(() => {
    // Fetch data on mount if not already loaded
    if (store.transitosPendientes.length === 0 && !store.loading) {
      store.fetchTransitosPendientes();
    }
  }, []);

  return {
    transitos: store.transitosPendientes,
    loading: store.loading,
    error: store.error,
    actions: {
      updateTransito: store.updateTransito,
      precintarTransito: store.precintarTransito,
      refresh: store.fetchTransitosPendientes,
    }
  };
};

export const useTransito = (id: string) => {
  const transitos = useTransitosStore((state) => state.transitos);
  const transito = transitos.find((t) => t.id === id);
  
  return {
    transito,
    found: !!transito,
  };
};