# Guía del Desarrollador - shadcn/ui en CMO

## Introducción

Esta guía proporciona instrucciones detalladas para trabajar con componentes shadcn/ui en el proyecto CMO. shadcn/ui es una biblioteca de componentes copiables que se integran directamente en tu código base.

## Principios Fundamentales

1. **Copy-paste, no instalación**: Los componentes se copian directamente a tu proyecto
2. **Personalización completa**: Tienes control total sobre el código
3. **Tema consistente**: Todos los componentes siguen el tema dark del proyecto
4. **Accesibilidad**: Componentes construidos con ARIA labels y navegación por teclado

## Instalación de Nuevos Componentes

### Comando Básico
```bash
npx shadcn@latest add [component-name]
```

### Ejemplos Comunes
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add chart
```

### Ubicación de Componentes
Todos los componentes se instalan en: `/src/components/ui/`

## Patrones de Uso

### 1. Importación de Componentes

```tsx
// Siempre usa imports absolutos con @/
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
```

### 2. Tema Dark Consistente

Todos los componentes deben usar las clases de tema dark:

```tsx
// ✅ Correcto
<Card className="bg-gray-800 border-gray-700">
  <CardContent>Contenido</CardContent>
</Card>

// ❌ Evitar
<Card className="bg-white border-gray-200">
  <CardContent>Contenido</CardContent>
</Card>
```

### 3. Variantes de Botones

```tsx
// Acción principal
<Button>Guardar</Button>

// Acción secundaria
<Button variant="secondary">Cancelar</Button>

// Acción destructiva
<Button variant="destructive">Eliminar</Button>

// Botón de icono
<Button size="icon" variant="ghost">
  <Icon className="h-4 w-4" />
</Button>
```

### 4. Formularios con Validación

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// 1. Define el esquema
const formSchema = z.object({
  nombre: z.string().min(1, 'Campo requerido'),
  email: z.string().email('Email inválido'),
});

// 2. Crear el formulario
export function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      email: '',
    },
  });

  const onSubmit = (data) => {
    console.log(data);
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
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}
```

### 5. Modales con Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function MyModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle>Título del Modal</DialogTitle>
        </DialogHeader>
        {/* Contenido del modal */}
      </DialogContent>
    </Dialog>
  );
}
```

### 6. Tablas de Datos

```tsx
import { DataTableV2 } from '@/components/ui/data-table/DataTableV2';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => (
      <Badge variant={row.original.estado === 'activo' ? 'default' : 'secondary'}>
        {row.original.estado}
      </Badge>
    ),
  },
];

<DataTableV2
  columns={columns}
  data={data}
  searchPlaceholder="Buscar..."
  showPagination={true}
/>
```

### 7. Estados de Carga

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Durante la carga
if (loading) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

// Contenido real
return <div>{content}</div>;
```

### 8. Gráficos

```tsx
import { NetworkChartV2 } from '@/features/dashboard/components/NetworkChartV2';

<NetworkChartV2
  data={[
    { timestamp: 1234567890, value: 45 },
    { timestamp: 1234567950, value: 52 },
  ]}
  title="Métricas del Sistema"
  type="line" // o "area"
  color="#3B82F6"
/>
```

### 9. Notificaciones Toast

```tsx
import { useToast } from '@/components/ui/use-toast';

export function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Éxito",
      description: "Operación completada correctamente",
    });
  };

  const handleError = () => {
    toast({
      title: "Error",
      description: "Algo salió mal",
      variant: "destructive",
    });
  };
}
```

## Accesibilidad

### ARIA Labels Obligatorios

```tsx
// ✅ Correcto - botones con solo iconos
<Button size="icon" variant="ghost" aria-label="Ver detalles">
  <Eye className="h-4 w-4" />
</Button>

// ✅ Correcto - inputs
<Input 
  placeholder="Buscar..." 
  aria-label="Buscar precintos"
/>
```

### Navegación por Teclado

Todos los componentes interactivos deben ser navegables con teclado:
- Tab/Shift+Tab para navegación
- Enter/Space para activación
- Escape para cerrar modales/popovers

## Mejores Prácticas

### 1. Organización de Componentes

```
src/
  features/
    [feature]/
      components/
        ComponenteOriginal.tsx    # Versión legacy
        ComponenteV2.tsx          # Versión con shadcn/ui
```

### 2. Nombrado Consistente

- Componentes migrados: añadir sufijo `V2`
- Skeletons: `[Component]Skeleton`
- Modales: `[Action]Modal` o `[Entity]DetailModal`

### 3. Performance

```tsx
// Usar React.memo para componentes pesados
export const HeavyComponent = React.memo(({ data }) => {
  return <div>{/* contenido */}</div>;
});

// Lazy loading para modales
const HeavyModal = React.lazy(() => import('./HeavyModal'));
```

### 4. Manejo de Errores

```tsx
try {
  await someAsyncOperation();
  toast({
    title: "Éxito",
    description: "Operación completada",
  });
} catch (error) {
  toast({
    title: "Error",
    description: error.message || "Algo salió mal",
    variant: "destructive",
  });
}
```

## Debugging

### Problemas Comunes

1. **Import paths incorrectos**
   - Solución: Usar `@/` en lugar de rutas relativas

2. **Estilos no aplicados**
   - Verificar que Tailwind CSS esté configurado
   - Revisar clases de tema dark

3. **TypeScript errors**
   - Ejecutar `npm run typecheck`
   - Verificar tipos en `@/components/ui/[component].tsx`

### Comandos Útiles

```bash
# Verificar tipos
npm run typecheck

# Linting
npm run lint

# Ver demo de componentes
# Navegar a: http://localhost:5173/demo
```

## Recursos

- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [TanStack Table](https://tanstack.com/table)

## Componentes Disponibles

### UI Base
- ✅ Button
- ✅ Input
- ✅ Select
- ✅ Checkbox
- ✅ Radio Group
- ✅ Switch
- ✅ Label

### Layout
- ✅ Card
- ✅ Dialog (Modal)
- ✅ Popover
- ✅ Alert

### Feedback
- ✅ Toast
- ✅ Skeleton
- ✅ Badge

### Navigation
- ✅ Breadcrumb

### Data Display
- ✅ DataTable
- ✅ Chart

### Forms
- ✅ Form
- ✅ FormField
- ✅ FormControl
- ✅ FormMessage

## Ejemplos en el Proyecto

Para ver ejemplos funcionales de todos los componentes:

1. Ejecutar el proyecto: `npm run dev`
2. Navegar a: `http://localhost:5173/demo`
3. Explorar el código en: `/src/components/ui/ShadcnDemo.tsx`

---

**Nota**: Esta guía se actualiza continuamente. Si encuentras algún problema o tienes sugerencias, por favor crea un issue en el repositorio.