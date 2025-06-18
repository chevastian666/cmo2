import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {AlertCircle, _CheckCircle, _XCircle, _Clock, _MapPin, Eye, _MessageSquare} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Alerta } from '../types';
import { 
  AnimatedBadge,
  AnimatedList,
  AnimatedListItem 
} from '@/components/animations/AnimatedComponents';
import {alertCriticalVariants, transitions, staggerContainer, staggerItem, pulseVariants} from '@/components/animations/AnimationPresets';

interface AlertsTableAnimatedProps {
  alertas: Alerta[];
  loading: boolean;
  onViewDetail: (alerta: Alerta) => void;
  onRespond?: (alerta: Alerta) => void;
  onVerify?: (alerta: Alerta) => void;
  onViewLocation?: (alerta: Alerta) => void;
}

export const AlertsTableAnimated: React.FC<AlertsTableAnimatedProps> = ({
  alertas,
  loading,
  onViewDetail,
  onRespond,
  onVerify,
  onViewLocation
}) => {
  const getSeverityIcon = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'alta':
        return <AlertCircle className="h-5 w-5 text-orange-400" />;
      case 'media':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'alta':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'media':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getStatusBadge = (alerta: Alerta) => {
    if (alerta.verificada) {
      return <AnimatedBadge variant="success">Verificada</AnimatedBadge>;
    }
    if (alerta.atendida) {
      return <AnimatedBadge variant="primary">Atendida</AnimatedBadge>;
    }
    return <AnimatedBadge variant="warning" pulse>Pendiente</AnimatedBadge>;
  };

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
        <p className="text-gray-400 mt-4">Cargando alertas...</p>
      </motion.div>
    );
  }

  if (alertas.length === 0) {
    return (
      <motion.div 
        className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transitions.smooth}
      >
        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <p className="text-gray-400">No hay alertas activas</p>
      </motion.div>
    );
  }

  // Separar alertas críticas para animarlas de forma especial
  const criticalAlerts = alertas.filter(a => a.severidad === 'critica' && !a.atendida);
  const otherAlerts = alertas.filter(a => a.severidad !== 'critica' || a.atendida);

  return (
    <motion.div 
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Alertas Críticas */}
      <AnimatePresence>
        {criticalAlerts.map((alerta, index) => (
          <motion.div
            key={alerta.id}
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            custom={index}
            className={cn(
              "bg-gray-800 rounded-lg border-2 overflow-hidden",
              getSeverityColor(alerta.severidad)
            )}
          >
            <motion.div
              variants={alertCriticalVariants}
              initial="initial"
              animate="animate"
              className="p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {getSeverityIcon(alerta.severidad)}
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">
                        {alerta.tipo.toUpperCase()} - {alerta.codigoPrecinto}
                      </h4>
                      {getStatusBadge(alerta)}
                      <AnimatedBadge variant="danger" pulse>
                        CRÍTICA
                      </AnimatedBadge>
                    </div>
                    
                    <p className="text-gray-300 mb-2">{alerta.mensaje}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(alerta.timestamp), 'dd/MM/yyyy HH:mm')}
                      </span>
                      {alerta.ubicacion && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alerta.ubicacion.lat.toFixed(4)}, {alerta.ubicacion.lng.toFixed(4)}
                        </span>
                      )}
                    </div>

                    {alerta.comentarios && alerta.comentarios.length > 0 && (
                      <motion.div 
                        className="mt-2 flex items-center gap-1 text-sm text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <MessageSquare className="h-3 w-3" />
                        {alerta.comentarios.length} comentarios
                      </motion.div>
                    )}
                  </div>
                </div>

                <motion.div 
                  className="flex gap-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onViewDetail(alerta)}
                      aria-label="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  
                  {onViewLocation && alerta.ubicacion && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onViewLocation(alerta)}
                        aria-label="Ver ubicación"
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                  
                  {onRespond && !alerta.atendida && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onRespond(alerta)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Responder
                      </Button>
                    </motion.div>
                  )}
                  
                  {onVerify && alerta.atendida && !alerta.verificada && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onVerify(alerta)}
                      >
                        Verificar
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Otras Alertas */}
      <AnimatePresence>
        {otherAlerts.map((alerta, index) => (
          <motion.div
            key={alerta.id}
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ x: 5 }}
            custom={index}
            className={cn(
              "bg-gray-800 rounded-lg border p-4 transition-all",
              "hover:bg-gray-700/50",
              getSeverityColor(alerta.severidad)
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...transitions.bounce, delay: index * 0.05 }}
                >
                  {getSeverityIcon(alerta.severidad)}
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-white">
                      {alerta.tipo.toUpperCase()} - {alerta.codigoPrecinto}
                    </h4>
                    {getStatusBadge(alerta)}
                  </div>
                  
                  <p className="text-gray-300 mb-2">{alerta.mensaje}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(alerta.timestamp), 'dd/MM/yyyy HH:mm')}
                    </span>
                    {alerta.ubicacion && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alerta.ubicacion.lat.toFixed(4)}, {alerta.ubicacion.lng.toFixed(4)}
                      </span>
                    )}
                  </div>

                  {alerta.comentarios && alerta.comentarios.length > 0 && (
                    <motion.div 
                      className="mt-2 flex items-center gap-1 text-sm text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <MessageSquare className="h-3 w-3" />
                      {alerta.comentarios.length} comentarios
                    </motion.div>
                  )}
                </div>
              </div>

              <motion.div 
                className="flex gap-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onViewDetail(alerta)}
                    aria-label="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </motion.div>
                
                {onViewLocation && alerta.ubicacion && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onViewLocation(alerta)}
                      aria-label="Ver ubicación"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
                
                {onRespond && !alerta.atendida && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onRespond(alerta)}
                    >
                      Responder
                    </Button>
                  </motion.div>
                )}
                
                {onVerify && alerta.atendida && !alerta.verificada && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onVerify(alerta)}
                    >
                      Verificar
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};