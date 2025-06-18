# Guía del Dashboard Interactivo - CMO

## Descripción General

El Dashboard Interactivo del CMO proporciona una vista personalizable y en tiempo real de todas las operaciones críticas. Los usuarios pueden reorganizar, redimensionar y personalizar los widgets según sus necesidades.

## Características Principales

### 1. Widgets Arrastrables y Redimensionables
- **Drag & Drop**: Arrastra widgets para reorganizar el dashboard
- **Redimensionar**: Ajusta el tamaño de cada widget según tus necesidades
- **Grid Responsivo**: Se adapta automáticamente a diferentes tamaños de pantalla

### 2. Modo Edición
- **Botón de Edición**: Click en el icono de candado para entrar/salir del modo edición
- **Guardar Layout**: Los cambios se guardan automáticamente en localStorage
- **Restablecer**: Opción para volver al diseño por defecto

### 3. Widgets Disponibles

#### KPI Widgets
- **Precintos Activos**: Muestra el número total de precintos operativos
- **Tránsitos en Ruta**: Cantidad de tránsitos actualmente en movimiento
- **Alertas Críticas**: Número de alertas que requieren atención inmediata
- **Tasa de Cumplimiento**: Porcentaje de operaciones exitosas

#### Widget de Gráficos
- **Tipos**: Línea, Barras, Área, Circular
- **Datos en Tiempo Real**: Se actualiza automáticamente
- **Interactivo**: Hover para ver detalles

#### Widget de Mapa
- **Vista en Tiempo Real**: Posiciones actuales de precintos y tránsitos
- **Leyenda**: Códigos de color para diferentes estados
- **Optimizado**: Carga lazy para mejor rendimiento

#### Widget de Alertas
- **Últimas 5 Alertas**: Vista rápida de alertas recientes
- **Severidad Visual**: Colores según criticidad
- **Tiempo Relativo**: "Hace X minutos/horas"

#### Widget de Actividad
- **Feed en Tiempo Real**: Últimas acciones del sistema
- **Filtrado por Tipo**: Precintos, tránsitos, alertas, sistema
- **Usuario y Tiempo**: Quién y cuándo realizó cada acción

#### Widget de Estadísticas
- **4 Métricas Clave**: Con barras de progreso visuales
- **Porcentajes**: Cálculo automático de cumplimiento
- **Animaciones**: Transiciones suaves al cargar

#### Widget de Tránsitos
- **Tránsitos Activos**: Lista de los 4 más relevantes
- **Progreso Visual**: Barra de progreso por tránsito
- **Alertas**: Indicador si hay alertas asociadas

#### Widget de Estado de Precintos
- **Grid de Estados**: Activos, En Tránsito, Con Alertas, Batería Baja
- **Precintos Críticos**: Lista de los que requieren atención
- **Totales**: Resumen general del inventario

## Uso del Dashboard

### Acceder al Dashboard
```
http://localhost:5173/dashboard-interactive
```

### Personalizar el Layout

1. **Entrar en Modo Edición**
   - Click en el icono de candado (🔒)
   - El icono cambiará a desbloqueado (🔓)

2. **Mover Widgets**
   - Click y mantén presionado en el header del widget
   - Arrastra a la nueva posición
   - Suelta para confirmar

3. **Redimensionar Widgets**
   - Busca el controlador en la esquina inferior derecha
   - Arrastra para cambiar el tamaño
   - Respeta los tamaños mínimos/máximos configurados

4. **Guardar Cambios**
   - Click en el botón guardar (💾)
   - Los cambios se persisten automáticamente

5. **Restablecer Layout**
   - Click en el botón restablecer (↻)
   - Vuelve a la configuración por defecto

### Configuración de Widgets

Cada widget tiene configuraciones específicas:

```typescript
{
  id: 'unique-id',
  type: 'widget-type',
  title: 'Título del Widget',
  minW: 3,  // Ancho mínimo en unidades de grid
  minH: 2,  // Alto mínimo
  maxW: 12, // Ancho máximo (opcional)
  maxH: 8   // Alto máximo (opcional)
}
```

### Breakpoints Responsivos

El dashboard se adapta automáticamente:
- **lg**: 1200px+ (12 columnas)
- **md**: 996px+ (10 columnas)
- **sm**: 768px+ (6 columnas)
- **xs**: 480px+ (4 columnas)
- **xxs**: 0px+ (2 columnas)

## Persistencia de Datos

### localStorage
- Los layouts se guardan con la key: `cmo_dashboard-layout`
- Incluye posiciones, tamaños y configuraciones
- Se sincroniza entre pestañas del mismo navegador

### Estructura de Datos Guardados
```json
{
  "layouts": {
    "lg": [...],
    "md": [...],
    "sm": [...],
    "xs": [...],
    "xxs": [...]
  },
  "visibleWidgets": ["widget-1", "widget-2"],
  "widgetSettings": {
    "chart-main": { "chartType": "area" }
  }
}
```

## Personalización Avanzada

### Agregar Nuevo Widget

1. **Crear el componente del widget**:
```typescript
// src/components/dashboard/widgets/MyWidget.tsx
export const MyWidget: React.FC = () => {
  return (
    <div className="h-full">
      {/* Contenido del widget */}
    </div>
  );
};
```

2. **Agregar a la configuración**:
```typescript
const widgets: WidgetConfig[] = [
  // ... otros widgets
  {
    id: 'my-widget',
    type: 'custom',
    title: 'Mi Widget',
    minW: 4,
    minH: 3
  }
];
```

3. **Agregar al renderizador**:
```typescript
const renderWidget = (widget: WidgetConfig) => {
  switch (widget.type) {
    // ... otros casos
    case 'custom':
      return <MyWidget />;
  }
};
```

### Estilos Personalizados

Los widgets usan clases de Tailwind y pueden personalizarse:

```css
/* Personalizar placeholder al arrastrar */
.react-grid-item.react-grid-placeholder {
  background: rgba(59, 130, 246, 0.15);
  border: 2px dashed rgba(59, 130, 246, 0.5);
}

/* Animación al arrastrar */
.react-grid-item.react-draggable-dragging {
  opacity: 0.8;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}
```

## Performance

### Optimizaciones Implementadas
- **Lazy Loading**: Componentes pesados se cargan bajo demanda
- **React.memo**: Previene re-renders innecesarios
- **Suspense**: Muestra estados de carga apropiados
- **Throttling**: Actualizaciones de layout limitadas

### Mejores Prácticas
1. No exceder 15-20 widgets simultáneos
2. Usar tamaños mínimos apropiados
3. Deshabilitar animaciones en dispositivos lentos
4. Considerar modo lectura para usuarios finales

## Troubleshooting

### El layout no se guarda
- Verificar localStorage no esté lleno
- Comprobar permisos del navegador
- Limpiar caché si es necesario

### Widgets no se mueven
- Asegurar modo edición activo
- Verificar no hay widgets bloqueados
- Revisar consola por errores

### Performance lento
- Reducir número de widgets
- Deshabilitar animaciones complejas
- Usar Chrome DevTools Performance

## Próximas Mejoras

1. **Selector de Widgets**: Panel para agregar/quitar widgets
2. **Temas de Dashboard**: Presets de layouts para diferentes roles
3. **Exportar/Importar**: Compartir configuraciones entre usuarios
4. **Widgets Personalizados**: API para widgets de terceros
5. **Modo Presentación**: Rotación automática de vistas

---

Por Cheva