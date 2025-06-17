import { useQuery } from '@tanstack/react-query';
import { estadisticasService } from '../../../services/estadisticas.service';
import { QUERY_KEYS } from '../../../config';

export const useEstadisticas = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ESTADISTICAS],
    queryFn: estadisticasService.getGenerales,
    refetchInterval: 3000,
  });
};

export const useHistoricoLecturas = (horas = 24) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ESTADISTICAS, 'lecturas', horas],
    queryFn: () => estadisticasService.getHistoricoLecturas(horas),
    refetchInterval: 60000,
  });
};

export const useRendimiento = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ESTADISTICAS, 'rendimiento'],
    queryFn: () => estadisticasService.getRendimiento(),
    refetchInterval: 60000,
  });
};

export const useEstadoSistema = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ESTADISTICAS, 'sistema'],
    queryFn: estadisticasService.getEstadoSistema,
    refetchInterval: 5000,
  });
};