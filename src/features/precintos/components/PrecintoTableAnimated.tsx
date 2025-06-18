import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {ChevronUp, ChevronDown, _MapPin, Eye, Send, History, Unlink, _XCircle} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PrecintoStatusBadge } from './PrecintoStatusBadge';
import { BatteryIndicator } from './BatteryIndicator';
import { SignalIndicator } from './SignalIndicator';
import { PrecintoStatus } from '../types';
import type { Precinto } from '../types';
import { 
  AnimatedList, 
  AnimatedListItem,
  AnimatedBadge 
} from '@/components/animations/AnimatedComponents';
import { hoverLiftVariants, transitions } from '@/components/animations/AnimationPresets';

interface PrecintoTableAnimatedProps {
  precintos: Precinto[];
  loading: boolean;
  onViewDetail: (precinto: Precinto) => void;
  onViewMap: (precinto: Precinto) => void;
  onAssign: (precinto: Precinto) => void;
  onSendCommand: (precinto: Precinto) => void;
  onViewHistory: (precinto: Precinto) => void;
  onMarkAsBroken?: (precinto: Precinto) => void;
}

export const PrecintoTableAnimated: React.FC<PrecintoTableAnimatedProps> = ({
  precintos,
  loading,
  onViewDetail,
  onViewMap,
  onAssign,
  onSendCommand,
  onViewHistory,
  onMarkAsBroken
}) => {
  const [sortField, setSortField] = React.useState<keyof Precinto>('id');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: keyof Precinto) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPrecintos = [...precintos].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (aValue === undefined) aValue = '';
    if (bValue === undefined) bValue = '';

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedPrecintos = sortedPrecintos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(sortedPrecintos.length / itemsPerPage));

  const SortIcon = ({ field }: { field: keyof Precinto }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const SortableHeader = ({ field, children }: { field: keyof Precinto; children: React.ReactNode }) => (
    <motion.th 
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </motion.th>
  );

  if (loading) {
    return (
      <motion.div 
        className="bg-gray-800 rounded-lg p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-gray-400 mt-4">Cargando precintos...</p>
      </motion.div>
    );
  }

  if (precintos.length === 0) {
    return (
      <motion.div 
        className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transitions.smooth}
      >
        <Unlink className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No se encontraron precintos</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gray-800 rounded-lg border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <SortableHeader field="id">ID</SortableHeader>
              <SortableHeader field="nserie">N° Serie</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Batería
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Señal
              </th>
              <SortableHeader field="telefono">Teléfono</SortableHeader>
              <SortableHeader field="ultimoReporte">Últ. Reporte</SortableHeader>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            <AnimatePresence mode="popLayout">
              {paginatedPrecintos.map((precinto, index) => (
                <motion.tr 
                  key={precinto.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    ...transitions.smooth,
                    delay: index * 0.05
                  }}
                  className={cn(
                    "hover:bg-gray-700/50 transition-colors",
                    precinto.status === PrecintoStatus.ROTO && "bg-red-900/20 hover:bg-red-900/30"
                  )}
                  whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ ...transitions.bounce, delay: index * 0.05 + 0.1 }}
                      >
                        <PrecintoStatusBadge status={precinto.status} size="sm" showText={false} />
                      </motion.div>
                      {precinto.status === PrecintoStatus.ROTO && (
                        <AnimatedBadge variant="danger" pulse>
                          ROTO
                        </AnimatedBadge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    <span className={cn(
                      "font-medium",
                      precinto.status === PrecintoStatus.ROTO ? "text-red-400 line-through" : "text-white"
                    )}>
                      {precinto.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    <span className={cn(
                      precinto.status === PrecintoStatus.ROTO ? "text-red-400 line-through" : "text-gray-300"
                    )}>
                      {precinto.nserie}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <BatteryIndicator level={precinto.bateria} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <SignalIndicator strength={precinto.signal} size="sm" />
                  </td>
                  <td className={cn(
                    "px-4 py-3 text-sm",
                    precinto.status === PrecintoStatus.ROTO ? "text-red-400/60" : "text-gray-300"
                  )}>
                    {precinto.telefono}
                  </td>
                  <td className={cn(
                    "px-4 py-3 text-sm",
                    precinto.status === PrecintoStatus.ROTO ? "text-red-400/60" : "text-gray-300"
                  )}>
                    {precinto.ultimoReporte || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <motion.div 
                      className="flex items-center justify-end gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ ...transitions.smooth, delay: index * 0.05 + 0.2 }}
                    >
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onViewDetail(precinto)}
                          title="Ver detalle"
                          aria-label={`Ver detalle del precinto ${precinto.codigo}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      {precinto.gps && (
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onViewMap(precinto)}
                            title="Ver en mapa"
                            aria-label={`Ver ubicación del precinto ${precinto.codigo} en el mapa`}
                          >
                            <MapPin className="h-4 w-4 text-blue-400" />
                          </Button>
                        </motion.div>
                      )}
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onSendCommand(precinto)}
                          title="Enviar comando"
                          aria-label={`Enviar comando al precinto ${precinto.codigo}`}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onViewHistory(precinto)}
                          title="Ver historial"
                          aria-label={`Ver historial del precinto ${precinto.codigo}`}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      {onMarkAsBroken && precinto.status !== PrecintoStatus.ROTO && (
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onMarkAsBroken(precinto)}
                            title="Marcar como roto"
                          >
                            <XCircle className="h-4 w-4 text-orange-400" />
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <motion.div 
        className="px-4 py-3 border-t border-gray-700 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...transitions.smooth, delay: 0.3 }}
      >
        <div className="text-sm text-muted-foreground">
          Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, precintos.length)} de {precintos.length} precintos
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                Math.abs(page - currentPage) <= 1
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 py-1 text-muted-foreground">...</span>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      variant={page === currentPage ? "default" : "secondary"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </motion.div>
                </React.Fragment>
              ))}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};