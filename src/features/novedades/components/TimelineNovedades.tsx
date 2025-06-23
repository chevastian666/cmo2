import React from 'react'
import { MapPin} from 'lucide-react'
import { EmptyState, LoadingState} from '../../../components/ui'
import { NovedadCard} from './NovedadCard'
import { cn} from '../../../utils/utils'
import type { Novedad} from '../types'
interface TimelineNovedadesProps {
  novedades: Novedad[]
  loading?: boolean
  onMarcarResuelta?: (novedad: Novedad) => void
  onAgregarSeguimiento?: (novedad: Novedad) => void
  onEditar?: (novedad: Novedad) => void
  onVerDetalles?: (novedad: Novedad) => void
  canEdit?: boolean
  userId?: string
  className?: string
}

export const TimelineNovedades: React.FC<TimelineNovedadesProps> = ({
  novedades, loading = false, onMarcarResuelta, onAgregarSeguimiento, onEditar, onVerDetalles, canEdit = false, userId, className
}) => {
  if (loading) {
    return <LoadingState variant="skeleton" rows={4} />
  }

  if (novedades.length === 0) {
    return (
      <EmptyState
        icon="file"
        title="Sin novedades"
        description="No hay novedades registradas para los filtros seleccionados"
        size="sm"
      />
    )
  }

  // Agrupar novedades por punto de operación
  const novedadesPorPunto = novedades.reduce((_acc, novedad) => {
    if (!acc[novedad.puntoOperacion]) {
      acc[novedad.puntoOperacion] = []
    }
    acc[novedad.puntoOperacion].push(_novedad)
    return acc
  }, {} as Record<string, Novedad[]>)
  // Ordenar puntos por cantidad de novedades
  const puntosOrdenados = Object.entries(_novedadesPorPunto)
    .sort(([, a], [, b]) => b.length - a.length)
  return (
    <div className={cn("space-y-6", className)}>
      {puntosOrdenados.map(([punto, novedadesPunto]) => (<div key={_punto} className="space-y-4">
          {/* Header del punto */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <MapPin className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">{_punto}</h3>
            </div>
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-sm text-gray-400">
              {novedadesPunto.length} novedad{novedadesPunto.length !== 1 ? 'es' : ''}
            </span>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-24 top-0 bottom-0 w-0.5 bg-gray-800" />

            {/* Novedades */}
            <div className="space-y-4">
              {novedadesPunto
                .sort((_a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
                .map((_novedad, index) => (
                  <div key={novedad.id} className="relative flex items-start gap-4">
                    {/* Hora */}
                    <div className="w-20 text-right flex-shrink-0">
                      <p className="text-sm font-mono text-gray-400">
                        {novedad.fechaCreacion.toLocaleTimeString('es-UY', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Punto en la línea */}
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2 bg-gray-900",
                        novedad.estado === 'resuelta' 
                          ? "border-green-500 bg-green-500" 
                          : novedad.estado === 'seguimiento'
                          ? "border-yellow-500 bg-yellow-500"
                          : "border-blue-500 bg-blue-500",
                        index === 0 && "animate-pulse"
                      )} />
                    </div>

                    {/* Card de la novedad */}
                    <div className="flex-1 pb-4">
                      <NovedadCard
                        novedad={_novedad}
                        onMarcarResuelta={_onMarcarResuelta}
                        onAgregarSeguimiento={_onAgregarSeguimiento}
                        onEditar={_onEditar}
                        onVerDetalles={_onVerDetalles}
                        canEdit={_canEdit}
                        isOwner={userId === novedad.creadoPor.id}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}