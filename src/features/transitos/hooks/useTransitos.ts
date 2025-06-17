import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transitosService, type TransitoFilters } from '../../../services/transitos.service';
import { QUERY_KEYS } from '../../../config';

export const useTransitosPendientes = (filters?: TransitoFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSITOS_PENDIENTES, filters],
    queryFn: () => transitosService.getPendientes(filters),
    refetchInterval: 30000,
  });
};

export const useTransitos = (filters?: TransitoFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSITOS_PENDIENTES, 'all', filters],
    queryFn: () => transitosService.getAll(filters),
    refetchInterval: 30000,
  });
};

export const useTransito = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSITOS_PENDIENTES, id],
    queryFn: () => transitosService.getById(id),
    enabled: !!id,
  });
};

export const useActualizarEstadoTransito = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: 'pendiente' | 'en_proceso' | 'precintado' }) => 
      transitosService.actualizarEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSITOS_PENDIENTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ESTADISTICAS] });
    },
  });
};

export const usePrecintarTransito = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ transitoId, precintoId }: { transitoId: string; precintoId: string }) => 
      transitosService.precintar(transitoId, precintoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSITOS_PENDIENTES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRECINTOS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ESTADISTICAS] });
    },
  });
};

export const useEstadisticasTransitos = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSITOS_PENDIENTES, 'estadisticas'],
    queryFn: transitosService.getEstadisticas,
    refetchInterval: 60000,
  });
};