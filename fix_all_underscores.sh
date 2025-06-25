#!/bin/bash

# Script to fix all underscore-prefixed variables in CMO3 project
# Created by Claude

echo "🔧 Fixing underscore-prefixed variables in CMO3 project..."

# Fix exports in config files
echo "📁 Fixing config files..."
sed -i '' 's/export const _API_CONFIG/export const API_CONFIG/g' src/config/index.ts
sed -i '' 's/export const _APP_CONFIG/export const APP_CONFIG/g' src/config/index.ts
sed -i '' 's/export const _QUERY_KEYS/export const QUERY_KEYS/g' src/config/index.ts

sed -i '' 's/export const _SHARED_CONFIG/export const SHARED_CONFIG/g' src/config/shared.config.ts
sed -i '' 's/export const _getAuthHeaders/export const getAuthHeaders/g' src/config/shared.config.ts
sed -i '' 's/export const _hasRole/export const hasRole/g' src/config/shared.config.ts
sed -i '' 's/export const _formatApiEndpoint/export const formatApiEndpoint/g' src/config/shared.config.ts
sed -i '' 's/_SHARED_CONFIG/SHARED_CONFIG/g' src/config/shared.config.ts
sed -i '' 's/const _token/const token/g' src/config/shared.config.ts
sed -i '' 's/_token/token/g' src/config/shared.config.ts
sed -i '' 's/const _baseUrl/const baseUrl/g' src/config/shared.config.ts
sed -i '' 's/_baseUrl/baseUrl/g' src/config/shared.config.ts

# Fix exports in constants files
echo "📁 Fixing constants files..."
sed -i '' 's/export const _ORIGENES_DESTINOS/export const ORIGENES_DESTINOS/g' src/constants/locations.ts
sed -i '' 's/export const _DESPACHANTES/export const DESPACHANTES/g' src/constants/locations.ts

sed -i '' 's/export const _ESTADO_PRECINTO/export const ESTADO_PRECINTO/g' src/constants/monitoring.ts
sed -i '' 's/export const _TIPO_PRECINTO/export const TIPO_PRECINTO/g' src/constants/monitoring.ts
sed -i '' 's/export const _ESTADO_ESLINGA/export const ESTADO_ESLINGA/g' src/constants/monitoring.ts
sed -i '' 's/export const _TIPO_ALERTA/export const TIPO_ALERTA/g' src/constants/monitoring.ts
sed -i '' 's/export const _SEVERIDAD_ALERTA/export const SEVERIDAD_ALERTA/g' src/constants/monitoring.ts
sed -i '' 's/export const _UBICACIONES_URUGUAY/export const UBICACIONES_URUGUAY/g' src/constants/monitoring.ts
sed -i '' 's/export const _TIPO_CARGA/export const TIPO_CARGA/g' src/constants/monitoring.ts
sed -i '' 's/export const _THRESHOLDS/export const THRESHOLDS/g' src/constants/monitoring.ts

# Fix function parameters in services
echo "📁 Fixing function parameters..."
sed -i '' 's/async (_filtros/async (filtros/g' src/services/api.service.ts
sed -i '' 's/async (_id/async (id/g' src/services/api.service.ts
sed -i '' 's/async (_precintoId/async (precintoId/g' src/services/api.service.ts
sed -i '' 's/_limit =/limit =/g' src/services/api.service.ts
sed -i '' 's/async (_activas/async (activas/g' src/services/api.service.ts
sed -i '' 's/async (_horas/async (horas/g' src/services/api.service.ts

# Fix trokor config endpoint functions
echo "📁 Fixing trokor config..."
sed -i '' 's/(_id: string)/\(id: string)/g' src/config/trokor.config.ts
sed -i '' 's/\${_id}/\${id}/g' src/config/trokor.config.ts
sed -i '' 's/(_nqr: string)/\(nqr: string)/g' src/config/trokor.config.ts
sed -i '' 's/\${_nqr}/\${nqr}/g' src/config/trokor.config.ts
sed -i '' 's/(_precintoId: string)/\(precintoId: string)/g' src/config/trokor.config.ts
sed -i '' 's/\${_precintoId}/\${precintoId}/g' src/config/trokor.config.ts
sed -i '' 's/const _token/const token/g' src/config/trokor.config.ts
sed -i '' 's/(_token)/\(token)/g' src/config/trokor.config.ts
sed -i '' 's/\${_token}/\${token}/g' src/config/trokor.config.ts
sed -i '' 's/(_endpoint: string, _base: string)/\(endpoint: string, base: string)/g' src/config/trokor.config.ts
sed -i '' 's/\${_base}\${_endpoint}/\${base}\${endpoint}/g' src/config/trokor.config.ts

# Fix component parameters
echo "📁 Fixing component parameters..."
sed -i '' 's/_motivoId: number/_motivoId: number/g' src/features/alertas/components/AlertsTableV2.tsx
sed -i '' 's/_motivoDescripcion: string/_motivoDescripcion: string/g' src/features/alertas/components/AlertsTableV2.tsx
sed -i '' 's/_observaciones?: string/_observaciones?: string/g' src/features/alertas/components/AlertsTableV2.tsx
sed -i '' 's/loading: _loading/loading/g' src/features/alertas/components/AlertsTableAnimated.tsx

# Fix logger middleware
echo "📁 Fixing logger middleware..."
sed -i '' 's/_error?: string/error?: string/g' src/store/middleware/logger.ts
sed -i '' "s/_error: '#EF4444'/error: '#EF4444'/g" src/store/middleware/logger.ts
sed -i '' 's/_options?: LoggerConfig/options?: LoggerConfig/g' src/store/middleware/logger.ts

# Update all imports
echo "📁 Updating all imports..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/import.*{ _API_CONFIG/import { API_CONFIG/g' \
  -e 's/import.*{ _APP_CONFIG/import { APP_CONFIG/g' \
  -e 's/import.*{ _QUERY_KEYS/import { QUERY_KEYS/g' \
  -e 's/import.*{ _SHARED_CONFIG/import { SHARED_CONFIG/g' \
  -e 's/import.*{ _getAuthHeaders/import { getAuthHeaders/g' \
  -e 's/import.*{ _hasRole/import { hasRole/g' \
  -e 's/import.*{ _formatApiEndpoint/import { formatApiEndpoint/g' \
  -e 's/import.*{ _ORIGENES_DESTINOS/import { ORIGENES_DESTINOS/g' \
  -e 's/import.*{ _DESPACHANTES/import { DESPACHANTES/g' \
  -e 's/import.*{ _ESTADO_PRECINTO/import { ESTADO_PRECINTO/g' \
  -e 's/import.*{ _TIPO_PRECINTO/import { TIPO_PRECINTO/g' \
  -e 's/import.*{ _ESTADO_ESLINGA/import { ESTADO_ESLINGA/g' \
  -e 's/import.*{ _TIPO_ALERTA/import { TIPO_ALERTA/g' \
  -e 's/import.*{ _SEVERIDAD_ALERTA/import { SEVERIDAD_ALERTA/g' \
  -e 's/import.*{ _UBICACIONES_URUGUAY/import { UBICACIONES_URUGUAY/g' \
  -e 's/import.*{ _TIPO_CARGA/import { TIPO_CARGA/g' \
  -e 's/import.*{ _THRESHOLDS/import { THRESHOLDS/g' \
  -e 's/_API_CONFIG as API_CONFIG/API_CONFIG/g' {} \;

echo "✅ All underscore-prefixed variables have been fixed!"
echo "📝 Next steps:"
echo "  1. Run: npm run lint"
echo "  2. Run: npx tsc --noEmit"
echo "  3. Test the application"