# Guía de Animaciones con Framer Motion - CMO

## Descripción General

Este documento describe cómo usar las animaciones fluidas implementadas con Framer Motion en el proyecto CMO. Las animaciones mejoran la experiencia del usuario proporcionando transiciones suaves y feedback visual inmediato.

## Instalación y Configuración

### Dependencias
```bash
npm install framer-motion
```

### Estructura de Archivos
```
src/components/animations/
├── AnimationPresets.tsx      # Presets y variantes de animación
├── AnimatedComponents.tsx    # Componentes animados reutilizables
├── PageTransitions.tsx       # Transiciones de página
└── AnimationsDemo.tsx        # Demo visual de animaciones
```

## Componentes Animados Disponibles

### 1. Componentes Base

#### FadeDiv
Animación de fade in/out
```tsx
import { FadeDiv } from '@/components/animations/AnimatedComponents';

<FadeDiv>
  <p>Contenido con fade animation</p>
</FadeDiv>
```

#### ScaleDiv
Animación de escala
```tsx
import { ScaleDiv } from '@/components/animations/AnimatedComponents';

<ScaleDiv>
  <div className="card">Contenido escalado</div>
</ScaleDiv>
```

#### SlideUpDiv / SlideDownDiv
Animaciones de deslizamiento
```tsx
import { SlideUpDiv, SlideDownDiv } from '@/components/animations/AnimatedComponents';

<SlideUpDiv>
  <h2>Título que aparece desde abajo</h2>
</SlideUpDiv>

<SlideDownDiv>
  <p>Texto que aparece desde arriba</p>
</SlideDownDiv>
```

### 2. Componentes UI Animados

#### AnimatedCard
Card con efecto hover lift
```tsx
import { AnimatedCard } from '@/components/animations/AnimatedComponents';

<AnimatedCard hover={true} onClick={() => console.log('clicked')}>
  <h3>Card Interactiva</h3>
  <p>Hover para ver el efecto lift</p>
</AnimatedCard>
```

#### AnimatedButton
Botón con animaciones de hover y tap
```tsx
import { AnimatedButton } from '@/components/animations/AnimatedComponents';

<AnimatedButton 
  variant="primary" 
  onClick={handleClick}
>
  Click Me
</AnimatedButton>
```

#### AnimatedBadge
Badge con animación de entrada y pulse opcional
```tsx
import { AnimatedBadge } from '@/components/animations/AnimatedComponents';

<AnimatedBadge variant="danger" pulse>
  CRÍTICO
</AnimatedBadge>

<AnimatedBadge variant="success">
  Completado
</AnimatedBadge>
```

#### AnimatedModal
Modal con animaciones de entrada/salida
```tsx
import { AnimatedModal } from '@/components/animations/AnimatedComponents';

<AnimatedModal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
>
  <div className="p-6">
    <h3>Título del Modal</h3>
    <p>Contenido del modal</p>
  </div>
</AnimatedModal>
```

### 3. Listas Animadas

#### AnimatedList + AnimatedListItem
Lista con efecto stagger
```tsx
import { AnimatedList, AnimatedListItem } from '@/components/animations/AnimatedComponents';

<AnimatedList>
  {items.map((item, index) => (
    <AnimatedListItem key={index}>
      <div className="item">{item.name}</div>
    </AnimatedListItem>
  ))}
</AnimatedList>
```

### 4. Indicadores de Carga

#### AnimatedSpinner
Spinner de carga animado
```tsx
import { AnimatedSpinner } from '@/components/animations/AnimatedComponents';

<AnimatedSpinner size="md" />
// Tamaños: 'sm' | 'md' | 'lg'
```

#### AnimatedSkeleton
Skeleton loader animado
```tsx
import { AnimatedSkeleton } from '@/components/animations/AnimatedComponents';

<AnimatedSkeleton variant="text" />
<AnimatedSkeleton variant="circular" />
<AnimatedSkeleton variant="rectangular" />
```

#### AnimatedProgress
Barra de progreso animada
```tsx
import { AnimatedProgress } from '@/components/animations/AnimatedComponents';

<AnimatedProgress value={75} color="bg-blue-500" />
```

## Transiciones de Página

### PageTransition
Envuelve el contenido de la página para transiciones suaves
```tsx
import { PageTransition } from '@/components/animations/PageTransitions';

<PageTransition variant="slide">
  <div className="page-content">
    {/* Contenido de la página */}
  </div>
</PageTransition>
```

Variantes disponibles: `'slide'` | `'fade'` | `'slideUp'`

### AnimatedSection
Secciones con delay de animación
```tsx
import { AnimatedSection } from '@/components/animations/PageTransitions';

<AnimatedSection delay={0.2}>
  <Card>Contenido de la sección</Card>
</AnimatedSection>
```

### AnimatedHeader
Header animado para páginas
```tsx
import { AnimatedHeader } from '@/components/animations/PageTransitions';

<AnimatedHeader 
  title="Dashboard" 
  subtitle="Centro de Monitoreo de Operaciones"
/>
```

### AnimatedGrid
Grid con animación stagger para elementos
```tsx
import { AnimatedGrid } from '@/components/animations/PageTransitions';

<AnimatedGrid className="grid grid-cols-3 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</AnimatedGrid>
```

## Presets de Animación

### Transiciones Predefinidas
```tsx
import { transitions } from '@/components/animations/AnimationPresets';

// Usar en animaciones custom
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={transitions.smooth}
>
  Contenido
</motion.div>
```

Transiciones disponibles:
- `fast` - Rápida y fluida
- `smooth` - Suave estándar
- `slow` - Lenta y elegante
- `bounce` - Con rebote
- `linear` - Lineal
- `easeInOut` - Ease in-out natural

### Variantes de Animación
```tsx
import { 
  fadeVariants,
  scaleVariants,
  slideUpVariants,
  pulseVariants,
  shakeVariants
} from '@/components/animations/AnimationPresets';

<motion.div
  variants={fadeVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  Contenido animado
</motion.div>
```

## Animaciones Específicas del Dominio

### Alerta Crítica
```tsx
import { alertCriticalVariants } from '@/components/animations/AnimationPresets';

<motion.div
  variants={alertCriticalVariants}
  initial="initial"
  animate="animate"
  className="alert-critical"
>
  <AlertCircle /> Temperatura Crítica
</motion.div>
```

### Tránsito en Movimiento
```tsx
import { transitMovingVariants } from '@/components/animations/AnimationPresets';

<motion.div
  variants={transitMovingVariants}
  initial="initial"
  animate="animate"
>
  Tránsito EN_RUTA
</motion.div>
```

### Precinto Activo
```tsx
import { precintoActiveVariants } from '@/components/animations/AnimationPresets';

<motion.div
  variants={precintoActiveVariants}
  initial="initial"
  animate="animate"
>
  Precinto Operativo
</motion.div>
```

## Ejemplos de Implementación

### 1. Tabla Animada
```tsx
import { PrecintoTableAnimated } from '@/features/precintos/components/PrecintoTableAnimated';

<PrecintoTableAnimated 
  precintos={precintos}
  loading={loading}
  onViewDetail={handleViewDetail}
  // ... otros props
/>
```

### 2. Lista de Alertas Animada
```tsx
import { AlertsTableAnimated } from '@/features/alertas/components/AlertsTableAnimated';

<AlertsTableAnimated
  alertas={alertas}
  loading={loading}
  onViewDetail={handleViewDetail}
  onRespond={handleRespond}
/>
```

### 3. Dashboard con Animaciones
```tsx
import { PageTransition, AnimatedSection, AnimatedGrid } from '@/components/animations/PageTransitions';
import { AnimatedCard } from '@/components/animations/AnimatedComponents';

function Dashboard() {
  return (
    <PageTransition variant="fade">
      <AnimatedSection delay={0}>
        <AnimatedHeader title="Dashboard" />
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <AnimatedGrid className="grid grid-cols-3 gap-4">
          <AnimatedCard>
            <KPICard title="Tránsitos Activos" value={127} />
          </AnimatedCard>
          <AnimatedCard>
            <KPICard title="Alertas Críticas" value={3} />
          </AnimatedCard>
          <AnimatedCard>
            <KPICard title="Precintos Operativos" value={95} />
          </AnimatedCard>
        </AnimatedGrid>
      </AnimatedSection>
    </PageTransition>
  );
}
```

### 4. Formulario con Animaciones
```tsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/components/animations/AnimationPresets';

function AnimatedForm() {
  return (
    <motion.form
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem}>
        <Label>Nombre</Label>
        <Input />
      </motion.div>
      
      <motion.div variants={staggerItem}>
        <Label>Email</Label>
        <Input type="email" />
      </motion.div>
      
      <motion.div variants={staggerItem}>
        <AnimatedButton type="submit">
          Enviar
        </AnimatedButton>
      </motion.div>
    </motion.form>
  );
}
```

## Mejores Prácticas

### 1. Performance
- Usar `AnimatePresence` para animaciones de salida
- Evitar animar propiedades costosas (width, height)
- Preferir transform y opacity
- Usar `layout` prop para animaciones de layout

### 2. Accesibilidad
- Respetar `prefers-reduced-motion`
- No depender solo de animaciones para feedback
- Mantener animaciones cortas y sutiles

### 3. Consistencia
- Usar presets predefinidos
- Mantener duraciones consistentes
- Seguir patrones establecidos

### 4. Uso Responsable
```tsx
// ✅ Bueno - Animación sutil y con propósito
<AnimatedBadge variant="danger" pulse>
  CRÍTICO
</AnimatedBadge>

// ❌ Evitar - Demasiadas animaciones
<motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }}>
  <motion.div animate={{ scale: [1, 2, 1] }}>
    <motion.p animate={{ opacity: [0, 1, 0] }}>
      Demasiado movimiento
    </motion.p>
  </motion.div>
</motion.div>
```

## Debugging

### Herramientas
1. **Framer Motion DevTools**: Para inspeccionar animaciones
2. **Chrome DevTools**: Performance tab para verificar FPS
3. **React DevTools**: Para verificar re-renders

### Problemas Comunes

**Animación no se ejecuta:**
```tsx
// Verificar que AnimatePresence envuelve elementos con exit
<AnimatePresence>
  {isVisible && <motion.div exit={{ opacity: 0 }}>...</motion.div>}
</AnimatePresence>
```

**Animación entrecortada:**
```tsx
// Usar transform en lugar de position
// ❌ Evitar
animate={{ left: 100 }}

// ✅ Preferir
animate={{ x: 100 }}
```

## Demo Interactiva

Para ver todas las animaciones en acción:
1. Ejecutar: `npm run dev`
2. Navegar a: `http://localhost:5173/animations`

## Recursos

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Best Practices](https://web.dev/animations/)
- [Archivos fuente](./src/components/animations/)

---

Por Cheva