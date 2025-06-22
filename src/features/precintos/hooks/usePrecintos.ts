import { useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import { precintosService} from '../../../services/precintos.service'
import { QUERY_KEYS} from '../../../config'
export const _usePrecintos = (filters?: PrecintoFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRECINTOS, filters], queryFn: () => precintosService.getAll(_filters),
    refetchInterval: 5000,
  })
}
export const _usePrecinto = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRECINTOS, id], queryFn: () => precintosService.getById(_id),
    enabled: !!id,
  })
}
export const _usePrecintosActivos = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRECINTOS, 'activos'],
    queryFn: precintosService.getActivos,
    refetchInterval: 5000,
  })
}
export const _usePrecintoEventos = (precintoId: string, limit = 50) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EVENTOS, precintoId, limit], queryFn: () => precintosService.getEventos(precintoId, limit),
    refetchInterval: 10000,
    enabled: !!precintoId,
  })
}
export const _useActivarPrecinto = () => {
  const _queryClient = useQueryClient()
  return useMutation({
    mutationFn: precintosService.activar, onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRECINTOS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ESTADISTICAS] })
    },
  })
}
export const _useDesactivarPrecinto = () => {
  const _queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) => 
      precintosService.desactivar(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRECINTOS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ESTADISTICAS] })
    },
  })
}