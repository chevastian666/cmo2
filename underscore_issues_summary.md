# Underscore-Prefixed Variables Causing TypeScript Errors

## Summary of Issues Found

### 1. Configuration Files

#### `/src/config/index.ts`
- `export const _API_CONFIG` - Used in multiple services
- `export const _APP_CONFIG` 
- `export const _QUERY_KEYS`

#### `/src/config/shared.config.ts`
- `export const _SHARED_CONFIG` - Main shared configuration
- `export const _getAuthHeaders` - Function with underscore prefix
- `export const _hasRole` - Function with underscore prefix
- `export const _formatApiEndpoint` - Function with underscore prefix
- Internal variables: `_token`, `_baseUrl`

#### `/src/constants/locations.ts`
- `export const _ORIGENES_DESTINOS`
- `export const _DESPACHANTES`

#### `/src/constants/monitoring.ts`
- `export const _ESTADO_PRECINTO`
- `export const _TIPO_PRECINTO`
- `export const _ESTADO_ESLINGA`

### 2. Function Parameters with Underscore Prefix

#### `/src/services/api.service.ts`
- Multiple function parameters: `_filtros`, `_id`, `_precintoId`, `_limit`, `_activas`, `_horas`

#### `/src/features/alertas/components/AlertsTableV2.tsx`
- Line 37: `_motivoId`, `_motivoDescripcion`, `_observaciones`

#### `/src/features/alertas/components/AlertsTableAnimated.tsx`
- Line 20: `loading: _loading` parameter

#### `/src/config/trokor.config.ts`
- Multiple endpoint builders with `_id`, `_nqr`, `_precintoId` parameters
- `buildTrokorUrl` function with `_endpoint`, `_base` parameters

#### `/src/store/middleware/logger.ts`
- Line 22: `_error` in colors interface
- Line 31: `_error` in defaultColors object
- Line 37: `_options` parameter in Logger type
- Line 79: Using `mergedColors._error`

### 3. Other Occurrences

- Various services and components using underscore-prefixed variables for unused parameters
- Import statements referencing the underscore-prefixed exports
- Property access with underscore prefix in multiple files

## Files Most Affected

1. `/src/config/index.ts` - Core configuration exports
2. `/src/config/shared.config.ts` - Shared configuration with multiple underscore exports
3. `/src/services/api.service.ts` - API service with many underscore parameters
4. `/src/config/trokor.config.ts` - Trokor configuration with underscore parameters
5. `/src/store/middleware/logger.ts` - Logger middleware with underscore properties
6. `/src/constants/locations.ts` - Location constants
7. `/src/constants/monitoring.ts` - Monitoring constants

## Recommended Fix Strategy

1. **Configuration Files**: Remove underscore prefix from exported constants
   - `_API_CONFIG` → `API_CONFIG`
   - `_APP_CONFIG` → `APP_CONFIG`
   - `_QUERY_KEYS` → `QUERY_KEYS`
   - `_SHARED_CONFIG` → `SHARED_CONFIG`
   - etc.

2. **Function Parameters**: For unused parameters, use proper naming or omit them
   - `_id` → `id` (if used) or remove parameter if not needed
   - `_options` → `options` or use `_` alone for unused parameters

3. **Helper Functions**: Remove underscore prefix
   - `_getAuthHeaders` → `getAuthHeaders`
   - `_hasRole` → `hasRole`
   - `_formatApiEndpoint` → `formatApiEndpoint`

4. **Update All Imports**: After renaming exports, update all import statements across the codebase

This will resolve TypeScript compilation errors related to underscore-prefixed identifiers.