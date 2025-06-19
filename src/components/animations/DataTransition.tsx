/**
 * Componente wrapper para transiciones suaves de datos
 * By Cheva
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataTransitionProps {
  children: React.ReactNode;
  dataKey?: string | number;
  className?: string;
}

export const DataTransition: React.FC<DataTransitionProps> = ({ 
  children, 
  dataKey,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Trigger re-animation when dataKey changes
    if (dataKey !== undefined) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [dataKey]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={dataKey}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.8 }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente para transiciones de lista
interface ListTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const ListTransition: React.FC<ListTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.4,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hook para detectar cambios en los datos
export const useDataChange = (data: any) => {
  const [hasChanged, setHasChanged] = useState(false);
  const [prevData, setPrevData] = useState(data);

  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(prevData)) {
      setHasChanged(true);
      setPrevData(data);
      const timer = setTimeout(() => setHasChanged(false), 500);
      return () => clearTimeout(timer);
    }
  }, [data, prevData]);

  return hasChanged;
};