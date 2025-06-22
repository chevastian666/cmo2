 
/**
 * Componentes de transición de página con Framer Motion
 * By Cheva
 */

import React from 'react';
import { motion, AnimatePresence} from 'framer-motion';
import { useLocation} from 'react-router-dom';
import { transitions} from './AnimationPresets';

// ==========================================
// VARIANTES DE TRANSICIÓN DE PÁGINA
// ==========================================

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      ...transitions.smooth,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast
  }
};

const fadePageVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const slideUpPageVariants = {
  initial: {
    opacity: 0,
    y: 30
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: transitions.fast
  }
};

// ==========================================
// COMPONENTE DE TRANSICIÓN DE PÁGINA
// ==========================================

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'slide' | 'fade' | 'slideUp';
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, variant = 'slide', className = ""
}) => {
  const location = useLocation();
  
  const variants = {
    slide: pageVariants,
    fade: fadePageVariants,
    slideUp: slideUpPageVariants
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants[variant]}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ==========================================
// COMPONENTE DE SECCIÓN ANIMADA
// ==========================================

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({ 
  children, delay = 0, className = "" 
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          ...transitions.smooth,
          delay
        }
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// ==========================================
// COMPONENTE DE HEADER ANIMADO
// ==========================================

interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ 
  title, subtitle, className = "" 
}) => {
  return (
    <motion.div className={`mb-6 ${className}`}>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={transitions.smooth}
        className="text-3xl font-bold text-white"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...transitions.smooth, delay: 0.1 }}
          className="text-gray-400 mt-2"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};

// ==========================================
// LAYOUT CON TRANSICIONES
// ==========================================

interface AnimatedLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const AnimatedLayout: React.FC<AnimatedLayoutProps> = ({ 
  children, sidebar 
}) => {
  return (
    <div className="flex h-screen bg-gray-900">
      {sidebar && (
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          transition={transitions.smooth}
          className="w-64 bg-gray-800 border-r border-gray-700"
        >
          {sidebar}
        </motion.aside>
      )}
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...transitions.smooth, delay: 0.2 }}
        className="flex-1 overflow-auto"
      >
        {children}
      </motion.main>
    </div>
  );
};

// ==========================================
// COMPONENTE DE TAB ANIMADO
// ==========================================

interface AnimatedTabPanelProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

export const AnimatedTabPanel: React.FC<AnimatedTabPanelProps> = ({ 
  children, isActive, className = "" 
}) => {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={transitions.smooth}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// COMPONENTE DE GRID ANIMADO
// ==========================================

interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({ 
  children, className = "", staggerDelay = 0.05
}) => {
  return (<motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 }, visible: {
          opacity: 1, transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { 
              opacity: 1, 
              scale: 1,
              transition: transitions.smooth
            }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default {
  PageTransition,
  AnimatedSection,
  AnimatedHeader,
  AnimatedLayout,
  AnimatedTabPanel,
  AnimatedGrid
};