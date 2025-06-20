# Integración con API de Trokor

## Resumen
El sistema CMO ahora puede conectarse directamente con la API de Trokor para obtener datos reales en lugar de usar datos simulados.

## Configuración

### 1. Variables de Entorno
Crea o actualiza tu archivo `.env` con las siguientes variables:

```env
# Habilitar API real
VITE_USE_REAL_API=true

# Credenciales de Trokor
VITE_API_KEY=tu_api_key_aqui

# URLs de la API (ajustar según documentación de Trokor)
VITE_TROKOR_API_BASE=https://api.trokor.com
VITE_TROKOR_MAINDB_BASE=https://maindb.trokor.com
VITE_TROKOR_AUXDB_BASE=https://auxdb.trokor.com
```

### 2. Iniciar la Aplicación
```bash
npm run dev
```

## Arquitectura

### Flujo de Datos
```
Usuario → Componente → Service → Trokor API → Adapter → Formato CMO
```

### Servicios Actualizados
1. **precintos.service.ts** - Obtiene precintos activos de Trokor
2. **transitos.service.ts** - Obtiene tránsitos pendientes de Trokor
3. **alertas.service.ts** - Obtiene alertas activas de Trokor
4. **estadisticas.service.ts** - Obtiene estadísticas del dashboard de Trokor

### Estrategia de Fallback
Cada servicio tiene 3 niveles de fallback:
1. **Primario**: API de Trokor (si VITE_USE_REAL_API=true)
2. **Secundario**: API unificada (si Trokor falla)
3. **Terciario**: Datos mock (para desarrollo)

## Endpoints Configurados

### Tránsitos
- `GET /viajes` - Lista todos los viajes
- `GET /viajes_pendientes` - Viajes pendientes de precintar
- `GET /viajes/:id` - Detalle de un viaje

### Precintos
- `GET /precintos` - Lista todos los precintos
- `GET /precintos_activos` - Precintos actualmente activos
- `GET /precintos/nqr/:nqr` - Buscar por código NQR

### Alertas
- `GET /alarmas` - Lista todas las alarmas
- `GET /alarmas_activas` - Alarmas sin atender
- `POST /alarmas/:id/verificar` - Verificar una alerta

### Estadísticas
- `GET /estadisticas/dashboard` - Métricas del dashboard

## Mapeo de Datos

### Estados de Viaje
```typescript
Trokor → CMO
0 → 'PENDIENTE'
1 → 'EN_TRANSITO'
2 → 'COMPLETADO'
3 → 'ALERTA'
```

### Tipos de Alarma
```typescript
Trokor → CMO
'AAR' → 'Atraso en reportes'
'BBJ' → 'Batería baja'
'DNR' → 'Desvío de ruta'
'PTN' → 'Violación del precinto'
// etc...
```

## Caché
- Las respuestas se cachean automáticamente para mejorar performance
- TTL configurable por tipo de dato:
  - Tránsitos: 30 segundos
  - Precintos activos: 15 segundos
  - Alertas: 10 segundos
  - Estadísticas: 60 segundos

## Próximos Pasos

1. **Obtener credenciales reales**:
   - Contactar al equipo de Trokor
   - Solicitar API key y documentación actualizada

2. **Probar endpoints**:
   - Verificar que las URLs sean correctas
   - Ajustar mapeo de datos según respuestas reales

3. **Implementar WebSocket**:
   - Para actualizaciones en tiempo real
   - Reducir polling innecesario

4. **Manejo de errores**:
   - Agregar reintentos automáticos
   - Mejorar mensajes de error para usuario

## Soporte
Para problemas con la integración:
1. Verificar credenciales en `.env`
2. Revisar consola del navegador para errores
3. Confirmar que la API de Trokor esté activa
4. Contactar soporte técnico de Trokor

By Cheva