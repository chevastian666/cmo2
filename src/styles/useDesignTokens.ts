/**
 * Hook y utilidades para usar los tokens de diseño en React
 * By Cheva
 */

import { designTokens} from './design-tokens'
/**
 * Hook para acceder a los tokens de diseño
 */
export const useDesignTokens = () => {
  return designTokens
}
/**
 * Clases CSS predefinidas usando los tokens de diseño
 */
export const tokenClasses = {
  // Fondos
  backgrounds: {
    primary: 'bg-gray-900',      // Fondo principal
    secondary: 'bg-gray-800',    // Cards y paneles
    tertiary: 'bg-gray-700',     // Elementos hover
    interactive: 'bg-gray-700 hover:bg-gray-600',
  },

  // Textos
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    disabled: 'text-gray-500',
    link: 'text-blue-400 hover:text-blue-300',
    error: 'text-red-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
  },

  // Bordes
  borders: {
    default: 'border-gray-700',
    focus: 'border-blue-500',
    error: 'border-red-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
  },

  // Espaciados comunes
  spacing: {
    card: 'p-6',
    section: 'p-8',
    compact: 'p-4',
    modal: 'p-6 sm:p-8',
    form: 'space-y-4',
    stack: 'space-y-6',
    inline: 'space-x-4',
  },

  // Componentes
  components: {
    // Cards
    card: 'bg-gray-800 border border-gray-700 rounded-lg shadow-dark',
    cardHeader: 'pb-4 border-b border-gray-700',
    cardBody: 'pt-4',
    
    // Botones
    button: {
      base: 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      ghost: 'hover:bg-gray-700 text-gray-300 hover:text-white',
      link: 'text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline',
    },
    
    // Inputs
    input: 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    
    // Modales
    modal: {
      overlay: 'fixed inset-0 bg-black/50 z-40',
      content: 'bg-gray-800 border border-gray-700 rounded-lg shadow-dark-xl',
      header: 'text-lg font-semibold text-white pb-4 border-b border-gray-700',
    },
    
    // Tablas
    table: {
      container: 'bg-gray-800 rounded-lg border border-gray-700 overflow-hidden',
      header: 'bg-gray-900/50 border-b border-gray-700',
      row: 'hover:bg-gray-700/50 transition-colors',
      cell: 'px-4 py-3',
    },
    
    // Badges
    badge: {
      base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      primary: 'bg-blue-900/50 text-blue-400 border border-blue-800',
      success: 'bg-green-900/50 text-green-400 border border-green-800',
      warning: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
      danger: 'bg-red-900/50 text-red-400 border border-red-800',
      gray: 'bg-gray-700 text-gray-300 border border-gray-600',
    },
    
    // Alertas
    alert: {
      base: 'p-4 rounded-lg border',
      info: 'bg-blue-900/20 border-blue-800 text-blue-400',
      success: 'bg-green-900/20 border-green-800 text-green-400',
      warning: 'bg-yellow-900/20 border-yellow-800 text-yellow-400',
      error: 'bg-red-900/20 border-red-800 text-red-400',
    },
  },

  // Estados
  states: {
    // Estados de tránsito
    transit: {
      active: 'text-blue-400 bg-blue-900/20',
      pending: 'text-yellow-400 bg-yellow-900/20',
      completed: 'text-green-400 bg-green-900/20',
      cancelled: 'text-red-400 bg-red-900/20',
      delayed: 'text-purple-400 bg-purple-900/20',
    },
    
    // Niveles de alerta
    alert: {
      critical: 'text-red-400 bg-red-900/20',
      high: 'text-orange-400 bg-orange-900/20',
      medium: 'text-yellow-400 bg-yellow-900/20',
      low: 'text-blue-400 bg-blue-900/20',
      info: 'text-gray-400 bg-gray-700',
    },
    
    // Estados de precinto
    precinto: {
      active: 'text-green-400 bg-green-900/20',
      inactive: 'text-gray-400 bg-gray-700',
      broken: 'text-red-400 bg-red-900/20',
      maintenance: 'text-yellow-400 bg-yellow-900/20',
    },
  },

  // Animaciones
  animations: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    shimmer: 'animate-shimmer',
  },

  // Utilidades
  utils: {
    // Truncate text
    truncate: 'truncate',
    lineClamp2: 'line-clamp-2',
    lineClamp3: 'line-clamp-3',
    
    // Scrollbar
    scrollbar: 'scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800',
    
    // Focus visible
    focusVisible: 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
    
    // Disabled
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  },
} as const
/**
 * Función helper para combinar clases de tokens
 */
export const combineTokenClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}
/**
 * Función para obtener colores específicos del dominio
 */
export const getDomainColor = (domain: 'transit' | 'alert' | 'precinto', status: string): string => {
  const colors = designTokens.colors[domain]
  return colors[status as keyof typeof colors] || designTokens.colors.gray[500]
}
/**
 * Función para obtener clases de estado
 */
export const getStateClasses = (domain: 'transit' | 'alert' | 'precinto', status: string): string => {
  const states = tokenClasses.states[domain]
  return states[status as keyof typeof states] || tokenClasses.states.precinto.inactive
}
export default useDesignTokens