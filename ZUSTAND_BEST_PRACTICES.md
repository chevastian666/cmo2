# Guía de Mejores Prácticas para Zustand - CMO

## Descripción General

Esta guía documenta las mejores prácticas y patrones implementados para el manejo de estado global con Zustand en el proyecto CMO.

## Nuevas Características Implementadas

### 1. Logger Middleware Personalizado

Un middleware de logging avanzado para debugging en desarrollo:

```typescript
import { logger } from '@/store/middleware';

const useStore = create(
  logger(
    (set) => ({
      // tu store
    }),
    {
      name: 'MyStore',
      collapsed: true,
      diff: true,
      actionFilter: (action) => !action.includes('temp')
    }
  )
);
```

Características:
- Logging con colores personalizados
- Muestra diff entre estados
- Filtrado de acciones
- Medición de performance
- Grupos colapsables en consola

### 2. Immer para Mutaciones Inmutables

Permite escribir mutaciones de forma más natural:

```typescript
// Sin immer
set((state) => ({
  ...state,
  users: state.users.map(u => 
    u.id === userId ? { ...u, name: newName } : u
  )
}));

// Con immer
set((state) => {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    user.name = newName;
  }
});
```

### 3. Manejo de Errores Estandarizado

Sistema consistente para manejar estados de carga y errores:

```typescript
import { executeAsyncAction, LoadingState } from '@/store/middleware/errorHandling';

interface MyState {
  loadingState: LoadingState;
  data: any[];
  
  fetchData: () => Promise<void>;
}

const useStore = create<MyState>((set) => ({
  loadingState: { status: 'idle' },
  data: [],
  
  fetchData: async () => {
    await executeAsyncAction(
      async () => {
        const data = await api.getData();
        set({ data });
        return data;
      },
      (loadingState) => set({ loadingState }),
      {
        errorMessage: 'Error al cargar datos',
        showErrorNotification: true
      }
    );
  }
}));
```

Estados disponibles:
- `idle`: Estado inicial
- `loading`: Cargando datos
- `success`: Operación exitosa
- `error`: Error con mensaje

### 4. Helpers de Persistencia

Configuración simplificada para persistir estado:

```typescript
import { createPersistedStore } from '@/store/middleware/persistHelpers';

const useStore = createPersistedStore(
  'my-store',
  (set) => ({
    // tu estado
  }),
  // Opcional: seleccionar qué persistir
  (state) => ({
    preferences: state.preferences,
    settings: state.settings
  })
);
```

Funciones útiles:
- `clearPersistedStore(name)`: Limpiar storage
- `exportAllPersistedStates()`: Exportar todos los estados
- `importPersistedStates(states)`: Importar estados
- `enableCrossTabSync()`: Sincronización entre pestañas

### 5. Factory createStore

Simplifica la creación de stores con todas las mejores prácticas:

```typescript
import { createStore } from '@/store/createStore';

export const useMyStore = createStore(
  (set, get) => ({
    // Estado
    count: 0,
    
    // Acciones
    increment: () => set((state) => {
      state.count += 1; // Gracias a immer!
    }),
    
    // Selectors
    getDoubleCount: () => get().count * 2
  }),
  {
    name: 'my-store',
    enableImmer: true,
    enableLogger: true,
    enableSubscribeWithSelector: true,
    persist: {
      partialize: (state) => ({ count: state.count })
    }
  }
);
```

## Patrones Recomendados

### 1. Estructura de Store

```typescript
interface StoreState {
  // Datos
  items: Item[];
  selectedItem: Item | null;
  
  // UI State
  loadingState: LoadingState;
  filters: FilterOptions;
  
  // Acciones
  fetchItems: () => Promise<void>;
  selectItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  
  // Computed/Selectors
  getFilteredItems: () => Item[];
  getItemById: (id: string) => Item | undefined;
}
```

### 2. Suscripciones Optimizadas

```typescript
// Suscribirse solo a cambios específicos
const unsubscribe = useStore.subscribe(
  (state) => state.selectedItem,
  (selectedItem) => {
    console.log('Item seleccionado cambió:', selectedItem);
  }
);

// Hook personalizado para casos comunes
export const useSelectedItem = () => {
  return useStore((state) => state.selectedItem);
};
```

### 3. Acciones Asíncronas

```typescript
fetchData: async () => {
  await executeAsyncAction(
    async () => {
      // 1. Llamar a la API
      const data = await api.getData();
      
      // 2. Actualizar estado (con immer)
      set((state) => {
        state.items = data;
        state.lastFetch = Date.now();
      });
      
      // 3. Retornar datos para logging
      return data;
    },
    (loadingState) => set({ loadingState }),
    {
      errorMessage: 'Error específico del contexto',
      successMessage: 'Datos cargados',
      showSuccessNotification: true
    }
  );
}
```

### 4. Tipos TypeScript

```typescript
// Definir tipos para el store completo
type MyStore = MyState & MyActions;

// Usar satisfies para mejor inferencia
const createMySlice: StateCreator<MyStore> = (set, get) => ({
  // implementación
}) satisfies StateCreator<MyStore>;
```

### 5. Testing

```typescript
// Store para testing
const useTestStore = createStore(
  initialState,
  {
    name: 'test-store',
    enableLogger: false, // Desactivar en tests
    enableDevtools: false
  }
);

// Reset para tests
beforeEach(() => {
  useTestStore.setState(initialState);
});
```

## Convenciones de Naming

### Stores
- Prefijo `use` para hooks: `useUserStore`, `usePrecintosStore`
- Sufijo `Store` para claridad
- Nombre descriptivo del dominio

### Acciones
- Verbos en infinitivo: `fetch`, `update`, `delete`, `reset`
- Prefijos según tipo:
  - `fetch*`: Obtener datos del servidor
  - `set*`: Establecer valor directo
  - `update*`: Actualizar parcialmente
  - `clear*`: Limpiar/resetear
  - `toggle*`: Alternar booleano

### Selectores
- Prefijo `get*` para computed values
- Prefijo `has*` para booleanos
- Nombres descriptivos: `getFilteredItems`, `hasUnsavedChanges`

### Estados
- `loading`, `error`, `data` para async
- `is*` para booleanos: `isOpen`, `isActive`
- `selected*` para selección actual

## Migración de Stores Existentes

Para migrar un store existente al nuevo patrón:

1. **Identificar el store actual**
```typescript
// Store actual
export const useOldStore = create(
  persist(
    (set) => ({
      // estado
    }),
    { name: 'old-store' }
  )
);
```

2. **Migrar usando createStore**
```typescript
// Store migrado
export const useNewStore = createStore(
  (set, get) => ({
    // estado con immer
  }),
  {
    name: 'new-store',
    persist: {
      migrate: (persistedState: any) => {
        // Lógica de migración si es necesario
        return persistedState;
      }
    }
  }
);
```

3. **Actualizar componentes gradualmente**
```typescript
// Componente con ambos stores durante migración
function MyComponent() {
  const oldData = useOldStore(state => state.data);
  const newData = useNewStore(state => state.data);
  
  // Usar newData cuando esté listo
  const data = newData || oldData;
}
```

## Debugging

### Con Logger Middleware
```typescript
// El logger mostrará en consola:
// → MyStore | fetchItems @ 10:23:45 (125.34ms)
//   prev state: { items: [], loading: false }
//   action:     fetchItems
//   next state: { items: [...], loading: false }
//   diff:       { items: { from: [], to: [...] } }
```

### Con Redux DevTools
```typescript
// Automáticamente habilitado en desarrollo
// Abre Redux DevTools Extension para ver:
// - Timeline de acciones
// - Estado actual
// - Time travel debugging
```

### Exportar Estado para Debug
```typescript
// En consola del navegador
import { exportAllPersistedStates } from '@/store/middleware/persistHelpers';
console.log(exportAllPersistedStates());
```

## Performance

### 1. Usar Selectores Específicos
```typescript
// ❌ Malo - Re-render en cualquier cambio
const state = useStore();

// ✅ Bueno - Re-render solo cuando cambia count
const count = useStore(state => state.count);
```

### 2. Memorizar Selectores Complejos
```typescript
// En el store
getExpensiveComputation: () => {
  const items = get().items;
  // Usar useMemo en el componente si es necesario
  return expensiveOperation(items);
}

// En el componente
const result = useMemo(
  () => store.getExpensiveComputation(),
  [items] // Dependencias específicas
);
```

### 3. Usar subscribeWithSelector
```typescript
// Suscribirse solo a partes específicas
useEffect(() => {
  const unsubscribe = useStore.subscribe(
    state => state.items.length,
    (length) => {
      console.log(`Ahora hay ${length} items`);
    }
  );
  return unsubscribe;
}, []);
```

## Ejemplos Completos

Ver `/src/store/examples/enhancedPrecintosStore.ts` para un ejemplo completo implementando todas las mejores prácticas.

## Recursos

- [Documentación oficial de Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zustand Recipes](https://docs.pmnd.rs/zustand/recipes/recipes)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)

---

Por Cheva