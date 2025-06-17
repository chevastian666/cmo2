# Block Tracker - Centro de Monitoreo

## Estructura del Proyecto

Este proyecto sigue una arquitectura modular basada en features para facilitar la escalabilidad y mantenimiento.

```
src/
├── config/              # Configuración de la aplicación
│   └── index.ts        # Configuración centralizada (API, App, Query Keys)
│
├── constants/          # Constantes de la aplicación
│   ├── index.ts       # Barrel export
│   └── monitoring.ts  # Constantes específicas del dominio
│
├── features/          # Módulos por feature
│   ├── alertas/      # Feature de alertas
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── common/       # Componentes compartidos
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── dashboard/    # Feature del dashboard principal
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── precintos/    # Feature de precintos
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   └── transitos/    # Feature de tránsitos
│       ├── components/
│       ├── hooks/
│       └── index.ts
│
├── services/         # Capa de servicios (API)
│   ├── alertas.service.ts
│   ├── api.service.ts
│   ├── estadisticas.service.ts
│   ├── precintos.service.ts
│   ├── transitos.service.ts
│   └── index.ts
│
├── types/           # Definiciones de TypeScript
│   ├── api.ts      # Tipos de respuestas API
│   ├── monitoring.ts # Tipos del dominio
│   └── index.ts
│
└── utils/          # Utilidades
    ├── formatters.ts  # Funciones de formato
    ├── mockData.ts   # Generadores de datos mock
    ├── utils.ts      # Utilidades generales (cn)
    ├── validators.ts # Funciones de validación
    └── index.ts
```

## Principios de Arquitectura

### 1. Organización por Features
- Cada feature tiene su propia carpeta con componentes y hooks
- Los componentes específicos de un feature viven dentro de su carpeta
- Los componentes compartidos están en `common`

### 2. Separación de Responsabilidades
- **Components**: Lógica de presentación
- **Hooks**: Lógica de estado y efectos secundarios
- **Services**: Comunicación con APIs externas
- **Utils**: Funciones puras reutilizables

### 3. Centralización de Configuración
- Todas las configuraciones en `/config`
- Constantes del dominio en `/constants`
- Tipos compartidos en `/types`

### 4. Imports Limpios
- Usar barrel exports (index.ts) en cada módulo
- Imports relativos solo dentro del mismo feature
- Imports absolutos entre features

## Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (ej: `PrecintosTable.tsx`)
- **Hooks**: camelCase con prefijo 'use' (ej: `usePrecintos.ts`)
- **Servicios**: camelCase con sufijo 'Service' (ej: `precintos.service.ts`)
- **Constantes**: UPPER_SNAKE_CASE

### Exports
- Preferir named exports sobre default exports
- Usar barrel exports para simplificar imports

### TypeScript
- Definir interfaces para props de componentes
- Usar tipos estrictos, evitar `any`
- Aprovechar los tipos de constantes

## Ejemplos de Uso

### Importar desde un feature
```typescript
import { PrecintosTable, usePrecintos } from '@/features/precintos';
```

### Importar servicios
```typescript
import { precintosService } from '@/services';
```

### Importar utilidades
```typescript
import { formatTime24h, cn } from '@/utils';
```

### Importar constantes
```typescript
import { ESTADO_PRECINTO, UBICACIONES_URUGUAY } from '@/constants';
```