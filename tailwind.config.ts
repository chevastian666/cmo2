import type { Config } from 'tailwindcss';
import { designTokens } from './src/styles/design-tokens';

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Colores del sistema
      colors: {
        // Colores base usando tokens
        gray: designTokens.colors.gray,
        primary: designTokens.colors.primary,
        success: designTokens.colors.success,
        warning: designTokens.colors.warning,
        error: designTokens.colors.error,
        info: designTokens.colors.info,
        
        // Colores específicos del dominio
        transit: designTokens.colors.transit,
        alert: designTokens.colors.alert,
        precinto: designTokens.colors.precinto,
        
        // Mapeo para shadcn/ui
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      
      // Espaciado usando tokens
      spacing: designTokens.spacing,
      
      // Tipografía usando tokens
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      letterSpacing: designTokens.typography.letterSpacing,
      lineHeight: designTokens.typography.lineHeight,
      
      // Bordes y esquinas usando tokens
      borderRadius: {
        ...designTokens.borders.borderRadius,
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      borderWidth: designTokens.borders.borderWidth,
      
      // Sombras usando tokens
      boxShadow: {
        none: designTokens.shadows.none,
        sm: designTokens.shadows.sm,
        DEFAULT: designTokens.shadows.DEFAULT,
        md: designTokens.shadows.md,
        lg: designTokens.shadows.lg,
        xl: designTokens.shadows.xl,
        '2xl': designTokens.shadows['2xl'],
        inner: designTokens.shadows.inner,
        // Sombras dark
        'dark-sm': designTokens.shadows.dark.sm,
        'dark': designTokens.shadows.dark.DEFAULT,
        'dark-md': designTokens.shadows.dark.md,
        'dark-lg': designTokens.shadows.dark.lg,
        'dark-xl': designTokens.shadows.dark.xl
      },
      
      // Animaciones usando tokens
      transitionDuration: designTokens.animations.duration,
      transitionTimingFunction: designTokens.animations.timing,
      keyframes: designTokens.animations.keyframes,
      
      // Z-index usando tokens
      zIndex: designTokens.zIndex,
      
      // Breakpoints personalizados
      screens: designTokens.breakpoints,
      
      // Animaciones personalizadas
      animation: {
        'spin': 'spin 1s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'attention': 'attention 2s ease-in-out infinite'
      }
    }
  },
  plugins: [import("tailwindcss-animate")],
};

export default config;