import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  MoreVertical, 
  Check, 
  Eye,
  Edit2,
  MessageSquare,
  Paperclip,
  Calendar
} from 'lucide-react';
import { Badge, Card, CardContent } from '../../../components/ui';
import { cn } from '../../../utils/utils';
import { formatTimeAgo, formatDateTime } from '../../../utils/formatters';
import type { Novedad } from '../types';
import { TIPOS_NOVEDAD } from '../types';

interface NovedadCardProps {
  novedad: Novedad;
  onMarcarResuelta?: (novedad: Novedad) => void;
  onAgregarSeguimiento?: (novedad: Novedad) => void;
  onEditar?: (novedad: Novedad) => void;
  onVerDetalles?: (novedad: Novedad) => void;
  canEdit?: boolean;
  isOwner?: boolean;
  className?: string;
}

export const NovedadCard: React.FC<NovedadCardProps> = ({
  novedad,
  onMarcarResuelta,
  onAgregarSeguimiento,
  onEditar,
  onVerDetalles,
  canEdit = false,
  isOwner = false,
  className
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const tipoConfig = TIPOS_NOVEDAD[novedad.tipoNovedad];
  
  // Verificar si es editable (creada en las últimas 24h por el mismo usuario)
  const esEditable = () => {
    if (!isOwner || !canEdit) return false;
    const horasDesdeCreacion = (Date.now() - novedad.fechaCreacion.getTime()) / (1000 * 60 * 60);
    return horasDesdeCreacion <= 24;
  };

  const getEstadoBadge = () => {
    switch (novedad.estado) {
      case 'resuelta':
        return <Badge variant="green" className="text-xs">Resuelta</Badge>;
      case 'seguimiento':
        return <Badge variant="yellow" className="text-xs">En seguimiento</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card 
      variant="elevated" 
      className={cn(
        "relative transition-all duration-200 hover:shadow-lg",
        novedad.estado === 'resuelta' && "opacity-75",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            {/* Icono del tipo */}
            <div className={cn(
              "p-2 rounded-lg text-2xl",
              `bg-${tipoConfig.color}-900/20`
            )}>
              {tipoConfig.icon}
            </div>
            
            {/* Info principal */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-white">
                  {tipoConfig.label}
                </h4>
                {getEstadoBadge()}
                {novedad.archivosAdjuntos && novedad.archivosAdjuntos.length > 0 && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Paperclip className="h-3 w-3" />
                    <span className="text-xs">{novedad.archivosAdjuntos.length}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{novedad.puntoOperacion}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(novedad.fechaCreacion.getTime() / 1000)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu de acciones */}
          {(canEdit || onVerDetalles) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
                    <div className="py-1">
                      {onVerDetalles && (
                        <button
                          onClick={() => {
                            onVerDetalles(novedad);
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
                        >
                          <Eye className="h-4 w-4" />
                          Ver detalles
                        </button>
                      )}
                      
                      {canEdit && novedad.estado !== 'resuelta' && onMarcarResuelta && (
                        <button
                          onClick={() => {
                            onMarcarResuelta(novedad);
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
                        >
                          <Check className="h-4 w-4" />
                          Marcar como resuelta
                        </button>
                      )}
                      
                      {canEdit && onAgregarSeguimiento && (
                        <button
                          onClick={() => {
                            onAgregarSeguimiento(novedad);
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Agregar seguimiento
                        </button>
                      )}
                      
                      {esEditable() && onEditar && (
                        <>
                          <div className="border-t border-gray-700 my-1" />
                          <button
                            onClick={() => {
                              onEditar(novedad);
                              setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
                          >
                            <Edit2 className="h-4 w-4" />
                            Editar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Descripción */}
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          {novedad.descripcion}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{novedad.creadoPor.nombre}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDateTime(novedad.fecha)}</span>
          </div>
        </div>

        {/* Resolución */}
        {novedad.resolucion && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-400 font-medium">
                  Resuelta por {novedad.resolucion.usuario.nombre}
                </p>
                {novedad.resolucion.comentario && (
                  <p className="text-sm text-gray-400 mt-1">
                    {novedad.resolucion.comentario}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateTime(novedad.resolucion.fecha)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seguimientos */}
        {novedad.seguimientos && novedad.seguimientos.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-400 mb-2">
              {novedad.seguimientos.length} seguimiento{novedad.seguimientos.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-2">
              {novedad.seguimientos.slice(-2).map(seg => (
                <div key={seg.id} className="flex items-start gap-2">
                  <MessageSquare className="h-3 w-3 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-300">{seg.comentario}</p>
                    <p className="text-xs text-gray-500">
                      {seg.usuario.nombre} - {formatTimeAgo(seg.fecha.getTime() / 1000)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};