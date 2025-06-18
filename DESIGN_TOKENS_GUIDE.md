# Guía de Tokens de Diseño - CMO

## Descripción General

El sistema de tokens de diseño del CMO proporciona un conjunto consistente de valores de diseño que garantizan coherencia visual en toda la aplicación. Los tokens están organizados en categorías claras y son fáciles de usar tanto en CSS como en JavaScript/TypeScript.

## Estructura de Archivos

```
src/styles/
├── design-tokens.ts      # Definición de todos los tokens
├── tokens.css           # Variables CSS
└── useDesignTokens.ts   # Hook y utilidades React
```

## Categorías de Tokens

### 1. Colores

#### Escala de Grises (Tema Dark)
```css
gray-50:  #fafafa  /* Texto principal sobre fondos oscuros */
gray-100: #f4f4f5
gray-200: #e4e4e7
gray-300: #d4d4d8  /* Texto secundario */
gray-400: #a1a1aa  /* Texto deshabilitado */
gray-500: #71717a
gray-600: #52525b
gray-700: #3f3f46  /* Bordes */
gray-800: #27272a  /* Fondos de cards */
gray-900: #18181b  /* Fondo principal */
gray-950: #09090b
```

#### Colores Semánticos
```typescript
// Primario (Azul)
primary-500: #3b82f6

// Éxito (Verde)
success-500: #22c55e

// Advertencia (Amarillo)
warning-500: #f59e0b

// Error (Rojo)
error-500: #ef4444

// Información (Azul claro)
info-500: #0ea5e9
```

#### Colores del Dominio

**Estados de Tránsito:**
- `transit-active`: Azul (#3b82f6)
- `transit-pending`: Amarillo (#f59e0b)
- `transit-completed`: Verde (#22c55e)
- `transit-cancelled`: Rojo (#ef4444)
- `transit-delayed`: Púrpura (#a855f7)

**Niveles de Alerta:**
- `alert-critical`: Rojo (#ef4444)
- `alert-high`: Naranja (#f97316)
- `alert-medium`: Amarillo (#f59e0b)
- `alert-low`: Azul (#3b82f6)
- `alert-info`: Gris (#6b7280)

**Estados de Precinto:**
- `precinto-active`: Verde (#22c55e)
- `precinto-inactive`: Gris (#6b7280)
- `precinto-broken`: Rojo (#ef4444)
- `precinto-maintenance`: Amarillo (#f59e0b)

### 2. Espaciado

Sistema basado en múltiplos de 4px:

```typescript
spacing: {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
}
```

### 3. Tipografía

#### Familias de Fuentes
```css
--font-sans: Inter, ui-sans-serif, system-ui, ...
--font-mono: "JetBrains Mono", ui-monospace, ...
```

#### Tamaños de Fuente
```typescript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
}
```

#### Pesos de Fuente
- `normal`: 400
- `medium`: 500
- `semibold`: 600
- `bold`: 700

### 4. Bordes y Esquinas

#### Radio de Borde
```typescript
borderRadius: {
  none: '0px',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px'    // Circular
}
```

### 5. Sombras

Sombras optimizadas para tema dark:

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.6);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.6);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.6);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.6);
```

### 6. Animaciones

#### Duraciones
```typescript
duration: {
  75: '75ms',
  100: '100ms',
  150: '150ms',  // Rápida
  200: '200ms',  // Base
  300: '300ms',  // Lenta
  500: '500ms',  // Muy lenta
}
```

#### Funciones de Temporización
```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 7. Z-Index

```typescript
zIndex: {
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
  notification: '1080'
}
```

## Uso en Componentes

### 1. Importar Tokens en TypeScript

```typescript
import { designTokens } from '@/styles/design-tokens';
import { useDesignTokens, tokenClasses } from '@/styles/useDesignTokens';

// Usar el hook
const tokens = useDesignTokens();

// Acceder a valores específicos
const primaryColor = tokens.colors.primary[500];
const spacing = tokens.spacing[4];
```

### 2. Usar Clases Predefinidas

```typescript
import { tokenClasses, combineTokenClasses } from '@/styles/useDesignTokens';

// Card component
<div className={tokenClasses.components.card}>
  <div className={tokenClasses.components.cardHeader}>
    <h3 className={tokenClasses.text.primary}>Título</h3>
  </div>
  <div className={tokenClasses.components.cardBody}>
    <p className={tokenClasses.text.secondary}>Contenido</p>
  </div>
</div>

// Botón con estado
<button 
  className={combineTokenClasses(
    tokenClasses.components.button.base,
    tokenClasses.components.button.primary,
    tokenClasses.utils.disabled
  )}
  disabled={loading}
>
  Guardar
</button>
```

### 3. Estados Dinámicos

```typescript
import { getStateClasses } from '@/styles/useDesignTokens';

// Estado de tránsito
<div className={getStateClasses('transit', transito.estado)}>
  {transito.estado}
</div>

// Nivel de alerta
<span className={getStateClasses('alert', alerta.nivel)}>
  {alerta.nivel}
</span>
```

### 4. Usar Variables CSS

```css
/* En archivos CSS */
.custom-component {
  background-color: hsl(var(--card));
  border-color: hsl(var(--border));
  border-radius: var(--radius);
  padding: calc(var(--spacing-unit) * 4);
  box-shadow: var(--shadow-md);
}

/* Estados personalizados */
.transit-card[data-state="active"] {
  border-color: hsl(var(--transit-active));
  background-color: hsl(var(--transit-active) / 0.1);
}
```

### 5. Componentes con Tokens

```typescript
// Card Component
export const Card: React.FC<CardProps> = ({ children, variant = 'default' }) => {
  const baseClasses = tokenClasses.components.card;
  const variantClasses = {
    default: '',
    elevated: 'shadow-dark-lg',
    interactive: 'hover:bg-gray-700/50 cursor-pointer transition-colors'
  };

  return (
    <div className={combineTokenClasses(baseClasses, variantClasses[variant])}>
      {children}
    </div>
  );
};

// Badge Component
export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray' }) => {
  const baseClasses = tokenClasses.components.badge.base;
  const variantClasses = tokenClasses.components.badge[variant];

  return (
    <span className={combineTokenClasses(baseClasses, variantClasses)}>
      {children}
    </span>
  );
};
```

## Patrones Comunes

### 1. Layout de Página
```tsx
<div className="min-h-screen bg-gray-900">
  <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
    {/* Header content */}
  </header>
  
  <main className="p-6 space-y-6">
    {/* Page content */}
  </main>
</div>
```

### 2. Card con Header
```tsx
<div className={tokenClasses.components.card}>
  <div className="flex items-center justify-between p-6 border-b border-gray-700">
    <h3 className="text-lg font-semibold text-white">Título</h3>
    <Badge variant="primary">Nuevo</Badge>
  </div>
  <div className="p-6">
    {/* Card content */}
  </div>
</div>
```

### 3. Formulario
```tsx
<form className={tokenClasses.spacing.form}>
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Nombre
    </label>
    <input 
      type="text" 
      className={tokenClasses.components.input}
    />
  </div>
  
  <div className="flex gap-3">
    <button className={combineTokenClasses(
      tokenClasses.components.button.base,
      tokenClasses.components.button.secondary
    )}>
      Cancelar
    </button>
    <button className={combineTokenClasses(
      tokenClasses.components.button.base,
      tokenClasses.components.button.primary
    )}>
      Guardar
    </button>
  </div>
</form>
```

### 4. Lista con Estados
```tsx
<div className={tokenClasses.components.table.container}>
  <div className={tokenClasses.components.table.header}>
    <h3 className="px-4 py-3 text-sm font-medium text-gray-400">
      Tránsitos Activos
    </h3>
  </div>
  
  {transitos.map(transito => (
    <div 
      key={transito.id}
      className={tokenClasses.components.table.row}
    >
      <div className={tokenClasses.components.table.cell}>
        <span className={getStateClasses('transit', transito.estado)}>
          {transito.estado}
        </span>
      </div>
    </div>
  ))}
</div>
```

## Migración de Componentes Existentes

### Antes (hardcoded):
```tsx
<div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
  <h3 className="text-white text-lg font-semibold mb-4">Título</h3>
  <p className="text-gray-300">Contenido</p>
</div>
```

### Después (con tokens):
```tsx
<div className={tokenClasses.components.card}>
  <h3 className={combineTokenClasses(
    tokenClasses.text.primary,
    "text-lg font-semibold mb-4"
  )}>
    Título
  </h3>
  <p className={tokenClasses.text.secondary}>Contenido</p>
</div>
```

## Beneficios del Sistema

1. **Consistencia**: Todos los componentes usan los mismos valores
2. **Mantenibilidad**: Cambios globales desde un único lugar
3. **Type Safety**: Autocompletado y validación en TypeScript
4. **Performance**: Clases reutilizables y optimizadas
5. **Accesibilidad**: Contrastes y tamaños apropiados
6. **Escalabilidad**: Fácil agregar nuevos tokens

## Mejores Prácticas

1. **Preferir tokens sobre valores hardcoded**
   ```tsx
   // ❌ Evitar
   <div className="bg-gray-800 p-6">
   
   // ✅ Preferir
   <div className={tokenClasses.components.card}>
   ```

2. **Usar funciones helper para estados dinámicos**
   ```tsx
   // ❌ Evitar
   <span className={`text-${getColorForStatus(status)}-400`}>
   
   // ✅ Preferir
   <span className={getStateClasses('transit', status)}>
   ```

3. **Combinar clases con la función helper**
   ```tsx
   // ✅ Correcto
   className={combineTokenClasses(
     tokenClasses.components.button.base,
     tokenClasses.components.button.primary,
     isLoading && tokenClasses.utils.disabled
   )}
   ```

4. **Documentar variaciones personalizadas**
   ```tsx
   // Documentar cuando se desvía de los tokens
   <div 
     className="bg-gray-850" // Color personalizado entre gray-800 y gray-900
     style={{ backgroundColor: '#1f1f23' }}
   >
   ```

## Recursos

- [Archivo de tokens](./src/styles/design-tokens.ts)
- [Variables CSS](./src/styles/tokens.css)
- [Utilidades React](./src/styles/useDesignTokens.ts)
- [Configuración Tailwind](./tailwind.config.ts)

---

Por Cheva