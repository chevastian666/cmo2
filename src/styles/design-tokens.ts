/**
 * CMO Design Tokens
 * Sistema de tokens de diseño consistentes para todo el proyecto
 * By Cheva
 */

// ==========================================
// COLORES
// ==========================================

export const colors = {
  // Colores base del tema dark
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46', // border-gray-700
    800: '#27272a', // bg-gray-800
    900: '#18181b', // bg-gray-900
    950: '#09090b'
  },

  // Colores semánticos
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },

  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // error/destructive
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // info
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e'
  },

  // Colores específicos del dominio
  transit: {
    active: '#3b82f6',
    pending: '#f59e0b',
    completed: '#22c55e',
    cancelled: '#ef4444',
    delayed: '#a855f7'
  },

  alert: {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#3b82f6',
    info: '#6b7280'
  },

  precinto: {
    active: '#22c55e',
    inactive: '#6b7280',
    broken: '#ef4444',
    maintenance: '#f59e0b'
  }
} as const;

// ==========================================
// ESPACIADO
// ==========================================

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem'      // 384px
} as const;

// ==========================================
// TIPOGRAFÍA
// ==========================================

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
  },

  // Font sizes
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],       // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],// 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
    '5xl': ['3rem', { lineHeight: '1' }],          // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],       // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],        // 72px
    '8xl': ['6rem', { lineHeight: '1' }],          // 96px
    '9xl': ['8rem', { lineHeight: '1' }]           // 128px
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
    3: '.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem'
  }
} as const;

// ==========================================
// BORDES Y ESQUINAS
// ==========================================

export const borders = {
  // Border radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Border width
  borderWidth: {
    0: '0px',
    DEFAULT: '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  }
} as const;

// ==========================================
// SOMBRAS
// ==========================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Sombras específicas para el tema dark
  dark: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.5)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.6), 0 1px 2px -1px rgb(0 0 0 / 0.6)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.6), 0 2px 4px -2px rgb(0 0 0 / 0.6)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.6)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.6)'
  }
} as const;

// ==========================================
// ANIMACIONES Y TRANSICIONES
// ==========================================

export const animations = {
  // Duraciones
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms'
  },

  // Funciones de temporización
  timing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Animaciones predefinidas
  keyframes: {
    spin: {
      to: {
        transform: 'rotate(360deg)'
      }
    },
    ping: {
      '75%, 100%': {
        transform: 'scale(2)',
        opacity: '0'
      }
    },
    pulse: {
      '50%': {
        opacity: '.5'
      }
    },
    bounce: {
      '0%, 100%': {
        transform: 'translateY(-25%)',
        animationTimingFunction: 'cubic-bezier(0.8,0,1,1)'
      },
      '50%': {
        transform: 'none',
        animationTimingFunction: 'cubic-bezier(0,0,0.2,1)'
      }
    }
  }
} as const;

// ==========================================
// BREAKPOINTS
// ==========================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// ==========================================
// Z-INDEX
// ==========================================

export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  
  // Específicos para componentes
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
  notification: '1080'
} as const;

// ==========================================
// COMPONENTES ESPECÍFICOS
// ==========================================

export const components = {
  // Cards
  card: {
    background: colors.gray[800],
    border: colors.gray[700],
    shadow: shadows.dark.DEFAULT,
    borderRadius: borders.borderRadius.lg,
    padding: spacing[6]
  },

  // Buttons
  button: {
    borderRadius: borders.borderRadius.md,
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      md: `${spacing[2.5]} ${spacing[4]}`,
      lg: `${spacing[3]} ${spacing[6]}`
    },
    fontSize: {
      sm: typography.fontSize.sm,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg
    }
  },

  // Inputs
  input: {
    background: colors.gray[700],
    border: colors.gray[600],
    borderRadius: borders.borderRadius.md,
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.base
  },

  // Modals
  modal: {
    background: colors.gray[800],
    border: colors.gray[700],
    shadow: shadows.dark.xl,
    borderRadius: borders.borderRadius.lg,
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      full: '100%'
    }
  },

  // Tables
  table: {
    background: colors.gray[800],
    headerBackground: colors.gray[900],
    border: colors.gray[700],
    rowHover: colors.gray[700],
    cellPadding: `${spacing[3]} ${spacing[4]}`
  },

  // Badges
  badge: {
    borderRadius: borders.borderRadius.full,
    padding: `${spacing[1]} ${spacing[2.5]}`,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium
  }
} as const;

// ==========================================
// UTILIDADES
// ==========================================

// Función para obtener el valor de color por string path
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = colors;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return '';
  }
  
  return value;
};

// Función para obtener el valor de espaciado
export const getSpacing = (value: number | string): string => {
  return spacing[value as keyof typeof spacing] || '';
};

// Exportar todos los tokens como un objeto único
export const designTokens = {
  colors,
  spacing,
  typography,
  borders,
  shadows,
  animations,
  breakpoints,
  zIndex,
  components
} as const;

export default designTokens;