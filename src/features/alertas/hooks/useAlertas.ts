import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertasService, type AlertaFilters } from '../../../services/alertas.service';
import { QUERY_KEYS } from '../../../config';

export const useAlertas = (filters?: AlertaFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ALERTAS, filters],
    queryFn: () => alertasService.getAll(filters),
    refetchInterval: 5000,
  });
};

export const useAlertasActivas = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ALERTAS, 'activas'],
    queryFn: alertasService.getActivas,
    refetchInterval: 5000,
  });
};

export const useAlerta = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ALERTAS, id],
    queryFn: () => alertasService.getById(id),
    enabled: !!id,
  });
};

export const useAtenderAlerta = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, observaciones }: { id: string; observaciones?: string }) => 
      alertasService.atender(id, observaciones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALERTAS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ESTADISTICAS] });
    },
  });
};

export const useCrearAlerta = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: alertasService.crear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALERTAS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ESTADISTICAS] });
    },
  });
};

export const useHistoricoAlertas = (horas = 24) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ALERTAS, 'historico', horas],
    queryFn: () => alertasService.getEstadisticas(horas),
    refetchInterval: 60000,
  });
};