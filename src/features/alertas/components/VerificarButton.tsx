 
import React from 'react';
import { Shield, CheckCircle2, Lock, Fingerprint} from 'lucide-react';
import { motion} from 'framer-motion';
import { cn} from '@/utils/utils';

interface VerificarButtonProps {
  onClick: () => void;
  variant?: 'default' | 'minimal' | 'gradient' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const VerificarButton: React.FC<VerificarButtonProps> = ({
  onClick, variant = 'default', size = 'md', disabled = false
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (variant === 'minimal') {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "group flex items-center gap-2 rounded-md font-medium transition-all",
          "text-gray-400 hover:text-white",
          "bg-gray-800 hover:bg-gray-700",
          "border border-gray-700 hover:border-gray-600",
          sizeClasses[size],
          disabled && "opacity-50 cursor-not-allowed"
        )}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <Shield className={cn(iconSize[size], "transition-transform group-hover:rotate-6")} />
        <span>Verificar</span>
      </motion.button>
    );
  }

  if (variant === 'gradient') {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "group relative flex items-center gap-2 rounded-lg font-medium",
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
          "shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30",
          "transition-all duration-300",
          sizeClasses[size],
          disabled && "opacity-50 cursor-not-allowed"
        )}
        whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 blur transition-opacity" />
        <Fingerprint className={cn(iconSize[size], "transition-all group-hover:rotate-12")} />
        <span>Verificar</span>
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.3, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </motion.button>
    );
  }

  if (variant === 'glow') {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "group relative flex items-center gap-2 rounded-lg font-medium",
          "bg-gray-800 text-blue-400 border border-blue-500/50",
          "hover:bg-blue-900/20 hover:border-blue-400",
          "transition-all duration-300",
          sizeClasses[size],
          disabled && "opacity-50 cursor-not-allowed"
        )}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <div className="absolute inset-0 rounded-lg bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
        <Lock className={cn(iconSize[size], "transition-transform group-hover:scale-110")} />
        <span>Verificar</span>
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-[-1px] rounded-lg bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 opacity-75 blur-sm" />
        </div>
      </motion.button>
    );
  }

  // Default variant
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex items-center gap-2 rounded-lg font-medium",
        "bg-blue-600 hover:bg-blue-700 text-white",
        "shadow-md hover:shadow-lg",
        "transition-all duration-200",
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed"
      )}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <Shield className={cn(iconSize[size], "transition-transform group-hover:rotate-12")} />
      <span>Verificar</span>
    </motion.button>
  );
};

export const VerificadoBadge: React.FC<{
  verificadoPor?: string;
  fecha?: Date;
  size?: 'sm' | 'md' | 'lg';
}> = ({ verificadoPor, fecha, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-2 rounded-lg",
        "bg-gradient-to-r from-green-900/20 to-emerald-900/20",
        "border border-green-800/50",
        "backdrop-blur-sm",
        sizeClasses[size]
      )}
    >
      <div className="relative">
        <CheckCircle2 className={cn(iconSize[size], "text-green-400")} />
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <CheckCircle2 className={cn(iconSize[size], "text-green-400")} />
        </motion.div>
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-green-400">Verificada</span>
        {(verificadoPor || fecha) && (
          <span className="text-xs text-green-600">
            {verificadoPor && `por ${verificadoPor}`}
            {verificadoPor && fecha && ' • '}
            {fecha && new Date(fecha).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
};