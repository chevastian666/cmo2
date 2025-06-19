# Guía de Skeleton Screens Inteligentes

## Introducción

Los skeleton screens mejoran significativamente la experiencia de usuario al mostrar una representación visual del contenido mientras se carga. Esta guía documenta la implementación de skeleton screens inteligentes en el sistema CMO.

## Componentes Disponibles

### 1. Skeleton Base
```typescript
import { Skeleton } from '@/components/ui/skeleton';

// Uso básico
<Skeleton variant="text" width="200px" height="20px" />
<Skeleton variant="circular" width="40px" height="40px" />
<Skeleton variant="rectangular" width="100%" height="200px" />
<Skeleton variant="rounded" width="100px" height="32px" />

// Animaciones
<Skeleton animation="pulse" /> // Default
<Skeleton animation="wave" />  // Efecto shimmer
<Skeleton animation="none" />  // Sin animación
```

### 2. Componentes Específicos

#### SkeletonText
```typescript
import { SkeletonText } from '@/components/ui/skeleton';

// Múltiples líneas de texto
<SkeletonText lines={3} />
```

#### SkeletonCard
```typescript
import { SkeletonCard } from '@/components/ui/skeleton';

// Card con contenido típico
<SkeletonCard />
```

#### SkeletonTable
```typescript
import { SkeletonTable } from '@/components/ui/skeleton';

// Tabla con filas y columnas personalizables
<SkeletonTable rows={5} columns={4} />
```

#### SkeletonList
```typescript
import { SkeletonList } from '@/components/ui/skeleton';

// Lista de items
<SkeletonList items={3} />
```

#### SkeletonDashboard
```typescript
import { SkeletonDashboard } from '@/components/ui/skeleton';

// Layout completo de dashboard
<SkeletonDashboard />
```

## Patrones de Implementación

### 1. Loading State Simple
```typescript
const MyComponent = () => {
  const { data, loading } = useData();

  if (loading) {
    return <SkeletonCard />;
  }

  return <ActualContent data={data} />;
};
```

### 2. Loading State Gradual
```typescript
const Dashboard = () => {
  const { stats, loading: loadingStats } = useStats();
  const { users, loading: loadingUsers } = useUsers();

  return (
    <div>
      {loadingStats ? (
        <SkeletonCard />
      ) : (
        <StatsCard stats={stats} />
      )}
      
      {loadingUsers ? (
        <SkeletonList items={5} />
      ) : (
        <UsersList users={users} />
      )}
    </div>
  );
};
```

### 3. Skeleton Personalizado
```typescript
const CustomSkeleton = () => (
  <Card className="bg-gray-900 border-gray-800">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="150px" height="24px" />
        <Skeleton variant="circular" width="32px" height="32px" />
      </div>
    </CardHeader>
    <CardContent>
      <SkeletonText lines={2} />
      <div className="mt-4 flex gap-2">
        <Skeleton variant="rounded" width="80px" height="32px" />
        <Skeleton variant="rounded" width="100px" height="32px" />
      </div>
    </CardContent>
  </Card>
);
```

## Ejemplo Completo: Bitácora Operacional

```typescript
const BitacoraOperacional = () => {
  const { novedades, loading } = useNovedadesStore();

  return (
    <div className="space-y-6">
      {loading ? (
        // Skeleton loader
        <>
          {Array.from({ length: 2 }).map((_, dateIndex) => (
            <div key={dateIndex} className="space-y-4">
              {/* Skeleton de fecha */}
              <div className="flex items-center gap-4">
                <Skeleton variant="circular" width="16px" height="16px" />
                <Skeleton variant="text" width="100px" height="14px" />
              </div>
              
              {/* Skeleton de entradas */}
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Skeleton variant="circular" width="40px" height="40px" />
                        <div className="flex-1 space-y-2">
                          <Skeleton variant="text" width="60%" />
                          <SkeletonText lines={2} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        // Contenido real
        <ActualContent data={novedades} />
      )}
    </div>
  );
};
```

## Mejores Prácticas

### 1. Coincidencia Visual
El skeleton debe coincidir lo más posible con el contenido real:
- Mismo tamaño y posición
- Mismos espaciados
- Misma estructura

### 2. Animación Apropiada
- **Pulse**: Para la mayoría de casos
- **Wave**: Para elementos destacados o cuando quieres un efecto más sofisticado
- **None**: Para reducir distracciones en contenido denso

### 3. Tiempos de Carga
```typescript
const [showSkeleton, setShowSkeleton] = useState(true);

useEffect(() => {
  // Mostrar skeleton mínimo 200ms para evitar flashing
  const timer = setTimeout(() => {
    if (!loading) {
      setShowSkeleton(false);
    }
  }, 200);

  return () => clearTimeout(timer);
}, [loading]);
```

### 4. Skeleton Contextual
Adapta el skeleton al contexto:
```typescript
// Para una tabla
if (loading) return <SkeletonTable rows={10} columns={5} />;

// Para cards en grid
if (loading) return (
  <div className="grid grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
```

### 5. Estados Vacíos vs Loading
Diferencia entre loading y estado vacío:
```typescript
if (loading) {
  return <SkeletonList items={5} />;
}

if (!data || data.length === 0) {
  return <EmptyState message="No hay datos disponibles" />;
}

return <DataList data={data} />;
```

## Personalización de Estilos

### CSS Variables
```css
:root {
  --skeleton-base: theme('colors.gray.800');
  --skeleton-highlight: rgba(255, 255, 255, 0.04);
  --skeleton-duration: 1.5s;
}
```

### Temas Personalizados
```typescript
const ThemedSkeleton = ({ variant = "light" }) => {
  const baseColor = variant === "light" ? "bg-gray-200" : "bg-gray-800";
  const highlightColor = variant === "light" 
    ? "rgba(0, 0, 0, 0.04)" 
    : "rgba(255, 255, 255, 0.04)";
    
  return (
    <div className={cn(baseColor, "animate-pulse rounded")}>
      {/* Contenido */}
    </div>
  );
};
```

## Performance

### 1. Lazy Loading
```typescript
const SkeletonDashboard = lazy(() => import('@/components/ui/skeleton').then(m => ({
  default: m.SkeletonDashboard
})));
```

### 2. Memoización
```typescript
const MemoizedSkeleton = memo(() => (
  <SkeletonCard />
));
```

### 3. Reducir Re-renders
```typescript
const StableSkeleton = () => {
  // Usar valores estables para prevenir re-renders
  const skeletonProps = useMemo(() => ({
    width: "100%",
    height: "200px"
  }), []);
  
  return <Skeleton {...skeletonProps} />;
};
```

## Integración con Suspense

```typescript
const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <LazyComponent />
    </Suspense>
  );
}
```

## Testing

```typescript
// Test que el skeleton se muestra durante loading
it('should show skeleton while loading', () => {
  const { getByTestId } = render(<MyComponent loading={true} />);
  expect(getByTestId('skeleton-loader')).toBeInTheDocument();
});

// Test que el skeleton desaparece después de cargar
it('should hide skeleton after loading', () => {
  const { queryByTestId, rerender } = render(<MyComponent loading={true} />);
  expect(queryByTestId('skeleton-loader')).toBeInTheDocument();
  
  rerender(<MyComponent loading={false} data={mockData} />);
  expect(queryByTestId('skeleton-loader')).not.toBeInTheDocument();
});
```

## Conclusión

Los skeleton screens inteligentes mejoran significativamente la percepción de velocidad y la experiencia del usuario. Úsalos consistentemente en toda la aplicación para crear una experiencia fluida y profesional.