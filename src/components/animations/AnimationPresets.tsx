/**
 * Presets de animación para Framer Motion
 * Colección de animaciones reutilizables para el proyecto CMO
 * By Cheva
 */

// No importamos tipos para evitar problemas con el bundler

// ==========================================
// TRANSICIONES
// ==========================================

export const transitions = {
  // Transición rápida y fluida
  fast: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8
  },
  
  // Transición suave estándar
  smooth: {
    type: "spring",
    stiffness: 300,
    damping: 25,
    mass: 1
  },
  
  // Transición lenta y elegante
  slow: {
    type: "spring",
    stiffness: 200,
    damping: 20,
    mass: 1.2
  },
  
  // Transición elástica
  bounce: {
    type: "spring",
    stiffness: 500,
    damping: 15,
    mass: 0.5
  },
  
  // Transición lineal para elementos técnicos
  linear: {
    type: "tween",
    ease: "linear",
    duration: 0.3
  },
  
  // Ease in-out para movimientos naturales
  easeInOut: {
    type: "tween",
    ease: "easeInOut",
    duration: 0.4
  }
} as const;

// ==========================================
// VARIANTES DE ANIMACIÓN
// ==========================================

// Fade In/Out
export const fadeVariants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: transitions.smooth
  },
  exit: { 
    opacity: 0,
    transition: transitions.fast
  }
};

// Scale + Fade
export const scaleVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.smooth
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: transitions.fast
  }
};

// Slide desde arriba
export const slideDownVariants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.smooth
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: transitions.fast
  }
};

// Slide desde abajo
export const slideUpVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.smooth
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: transitions.fast
  }
};

// Slide desde la izquierda
export const slideLeftVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.smooth
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: transitions.fast
  }
};

// Slide desde la derecha
export const slideRightVariants = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.smooth
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: transitions.fast
  }
};

// Rotación + Scale
export const rotateScaleVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    rotate: -10 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: transitions.bounce
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    rotate: 10,
    transition: transitions.fast
  }
};

// Stagger para listas
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.smooth
  }
};

// ==========================================
// ANIMACIONES DE ESTADO
// ==========================================

// Pulse para elementos activos
export const pulseVariants = {
  initial: {
    scale: 1
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Shake para errores
export const shakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "linear"
    }
  }
};

// Glow para elementos importantes
export const glowVariants = {
  initial: {
    boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)"
  },
  glow: {
    boxShadow: [
      "0 0 0 0 rgba(59, 130, 246, 0)",
      "0 0 20px 5px rgba(59, 130, 246, 0.5)",
      "0 0 0 0 rgba(59, 130, 246, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ==========================================
// ANIMACIONES ESPECÍFICAS DEL DOMINIO
// ==========================================

// Animación para alertas críticas
export const alertCriticalVariants = {
  initial: {
    scale: 1,
    opacity: 1
  },
  animate: {
    scale: [1, 1.02, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Animación para tránsitos en movimiento
export const transitMovingVariants = {
  initial: {
    x: 0
  },
  animate: {
    x: [0, 5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Animación para precintos activos
export const precintoActiveVariants = {
  initial: {
    opacity: 0.8
  },
  animate: {
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ==========================================
// GESTOS Y HOVER
// ==========================================

export const hoverScaleVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: transitions.fast
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const hoverLiftVariants = {
  initial: { 
    y: 0,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.6)"
  },
  hover: { 
    y: -2,
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.6)",
    transition: transitions.fast
  },
  tap: { 
    y: 0,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.6)",
    transition: { duration: 0.1 }
  }
};

// ==========================================
// UTILIDADES
// ==========================================

// Función para crear variantes de delay personalizadas
export const createDelayedVariants = (delay: number) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...transitions.smooth,
      delay
    }
  }
});

// Función para crear stagger personalizado
export const createStaggerVariants = (staggerDelay: number = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1
    }
  }
});

// Preset para modales
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.smooth
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: transitions.fast
  }
};

// Preset para overlays
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

// Preset para notificaciones
export const notificationVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.bounce
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.fast
  }
};

// ==========================================
// ALIAS COMUNES
// ==========================================

// Alias para fadeInUp (slide desde abajo)
export const fadeInUp = slideUpVariants;

// Alias para staggerChildren
export const staggerChildren = staggerContainer;

// Alias para scaleIn
export const scaleIn = scaleVariants;

// Alias para slideInRight
export const slideInRight = slideRightVariants;

export default {
  transitions,
  fadeVariants,
  scaleVariants,
  slideDownVariants,
  slideUpVariants,
  slideLeftVariants,
  slideRightVariants,
  rotateScaleVariants,
  staggerContainer,
  staggerItem,
  pulseVariants,
  shakeVariants,
  glowVariants,
  alertCriticalVariants,
  transitMovingVariants,
  precintoActiveVariants,
  hoverScaleVariants,
  hoverLiftVariants,
  modalVariants,
  overlayVariants,
  notificationVariants,
  createDelayedVariants,
  createStaggerVariants,
  // Aliases
  fadeInUp,
  staggerChildren,
  scaleIn,
  slideInRight
};