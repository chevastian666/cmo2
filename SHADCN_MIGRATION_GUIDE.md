# Guía de Migración a shadcn/ui

## Descripción General

Este documento detalla los patrones y mejores prácticas para migrar componentes existentes a shadcn/ui en el proyecto CMO.

## Configuración Inicial

### 1. Instalación

```bash
npx shadcn@latest init
```

Configuración utilizada:
- Style: New York
- Base color: Neutral  
- CSS variables: Yes

### 2. Configuración de Path Alias

En `tsconfig.app.json` y `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

En `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### 3. Tema Dark Mode

En `src/index.css`:
```css
@layer base {
  :root {
    --background: 0 0% 7%;
    --foreground: 0 0% 98%;
    --card: 0 0% 13%;
    --card-foreground: 0 0% 98%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 98%;
    /* ... resto de variables */
  }
}
```

## Patrones de Migración

### 1. Botones

**Antes:**
```tsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
  Click me
</button>
```

**Después:**
```tsx
import { Button } from '@/components/ui/button';

<Button>Click me</Button>
// O con variantes específicas
<Button variant="destructive">Delete</Button>
<Button size="icon" variant="ghost">
  <Icon className="h-4 w-4" />
</Button>
```

### 2. Modales → Dialog

**Antes:**
```tsx
{isOpen && (
  <>
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg">
        {/* contenido */}
      </div>
    </div>
  </>
)}
```

**Después:**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="bg-gray-800 border-gray-700">
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    {/* contenido */}
  </DialogContent>
</Dialog>
```

### 3. Formularios con Validación

**Patrón Completo con react-hook-form + Zod:**

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      email: '',
    },
  });

  const onSubmit = (data: FormData) => {
    // handle submit
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### 4. Tablas con DataTable

```tsx
import { DataTableV2 } from '@/components/ui/data-table/DataTableV2';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<TData>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  // más columnas...
];

<DataTableV2
  columns={columns}
  data={data}
  searchPlaceholder="Buscar..."
  showPagination={true}
/>
```

### 5. Estados de Carga con Skeleton

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton básico
<Skeleton className="h-4 w-32" />

// Componente con loading state
export function MyComponent({ loading }: { loading: boolean }) {
  if (loading) {
    return <MyComponentSkeleton />;
  }
  
  return <div>Contenido real</div>;
}
```

### 6. Popovers para Información Adicional

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

<Popover>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="icon">
      <Info className="h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="grid gap-4">
      <h4 className="font-medium">Información</h4>
      <p className="text-sm text-muted-foreground">
        Detalles adicionales aquí
      </p>
    </div>
  </PopoverContent>
</Popover>
```

## Mejores Prácticas

### 1. Mantenimiento del Tema Dark

- Usar clases de utilidad de Tailwind que respeten el tema
- Para colores personalizados, usar: `bg-gray-800`, `border-gray-700`
- Evitar colores hardcodeados

### 2. Accesibilidad

- Todos los botones icon-only deben tener aria-label
- Usar componentes semánticos (Button vs div clickeable)
- Mantener jerarquía de encabezados

### 3. Performance

- Usar React.memo para componentes pesados
- Implementar loading states con Skeleton
- Lazy loading para modales y componentes grandes

### 4. Consistencia

- Usar variantes de botón consistentemente:
  - Primary actions: default
  - Secondary: variant="secondary"
  - Destructive: variant="destructive"
  - Icon buttons: size="icon" variant="ghost"

### 5. Organización de Archivos

```
src/
  components/
    ui/                    # Componentes shadcn/ui
    feature/
      ComponentV2.tsx      # Versión migrada
      ComponentSkeleton.tsx # Loading state
```

## Componentes Migrados

### Completados

1. **LoginPage** - Formulario de login con validación
2. **PrecintoTable** - Botones de acción y paginación con ARIA labels
3. **DepositoFilters** - Selects y filtros
4. **AlertaDetalleModalV2** - Modal complejo con Dialog
5. **ResponderAlertaModalV2** - Modal con formulario
6. **TransitoDetailModalV2** - Modal con mapa y controles de línea de tiempo
7. **FormularioCamioneroV2** - Formulario completo con react-hook-form y Zod
8. **PrecintosTableV2** - DataTable avanzada con ordenamiento, filtrado y popovers
9. **Skeleton Loaders** - Estados de carga para cards, tablas y formularios
10. **VerificarAlertaModalV2** - Modal de verificación con badges de estado
11. **EditTransitoModalV2** - Modal de edición con validación de formulario
12. **BreadcrumbNav** - Navegación breadcrumb automática para todas las páginas
13. **Toast Notifications** - Integrado con el sistema de notificaciones existente
14. **NetworkChartV2** - Gráficos de línea y área con shadcn/ui Chart

### Características Implementadas

- ✅ Accesibilidad completa con ARIA labels en botones icon-only
- ✅ Integración con react-hook-form y validación Zod
- ✅ Data tables con @tanstack/react-table
- ✅ Popovers para información contextual
- ✅ Skeleton loaders para mejorar UX durante carga
- ✅ Breadcrumb navigation automática
- ✅ Tema dark mode consistente

### Pendientes

- Tests de componentes migrados
- Documentación de uso para desarrolladores

## Comandos Útiles

```bash
# Instalar componente específico
npx shadcn@latest add [component]

# Linting
npm run lint

# Type checking  
npm run typecheck
```

## Referencias

- [shadcn/ui Docs](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [TanStack Table](https://tanstack.com/table)