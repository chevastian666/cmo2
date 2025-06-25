#!/bin/bash

# Script to fix underscore-prefixed variables in configuration and constant files
# This script will rename the most common underscore-prefixed exports and update imports

echo "=== Fixing underscore-prefixed variables in configuration files ==="
echo ""

# Create backup directory
BACKUP_DIR="underscore_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Function to backup and replace in file
fix_file() {
    local file=$1
    local search=$2
    local replace=$3
    
    if [ -f "$file" ] && grep -q "$search" "$file"; then
        # Create backup if not already done
        if [ ! -f "$BACKUP_DIR/$(basename $file).bak" ]; then
            cp "$file" "$BACKUP_DIR/$(basename $file).bak"
        fi
        sed -i '' "s/\b${search}\b/${replace}/g" "$file"
        echo "✓ Fixed $search → $replace in $file"
    fi
}

echo "1. Fixing configuration exports..."

# Fix main config exports
fix_file "src/config/index.ts" "_API_CONFIG" "API_CONFIG"
fix_file "src/config/index.ts" "_APP_CONFIG" "APP_CONFIG" 
fix_file "src/config/index.ts" "_QUERY_KEYS" "QUERY_KEYS"

# Fix shared config
fix_file "src/config/shared.config.ts" "_SHARED_CONFIG" "SHARED_CONFIG"
fix_file "src/config/shared.config.ts" "_getAuthHeaders" "getAuthHeaders"
fix_file "src/config/shared.config.ts" "_hasRole" "hasRole"
fix_file "src/config/shared.config.ts" "_formatApiEndpoint" "formatApiEndpoint"
fix_file "src/config/shared.config.ts" "_token" "token"
fix_file "src/config/shared.config.ts" "_baseUrl" "baseUrl"

# Fix constants
fix_file "src/constants/locations.ts" "_ORIGENES_DESTINOS" "ORIGENES_DESTINOS"
fix_file "src/constants/locations.ts" "_DESPACHANTES" "DESPACHANTES"
fix_file "src/constants/monitoring.ts" "_ESTADO_PRECINTO" "ESTADO_PRECINTO"
fix_file "src/constants/monitoring.ts" "_TIPO_PRECINTO" "TIPO_PRECINTO"
fix_file "src/constants/monitoring.ts" "_ESTADO_ESLINGA" "ESTADO_ESLINGA"

# Fix logger middleware
fix_file "src/store/middleware/logger.ts" "_error:" "error:"
fix_file "src/store/middleware/logger.ts" "\\._error" ".error"

echo ""
echo "2. Updating imports across the codebase..."

# Find all TypeScript files and update imports
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    # Skip node_modules and build directories
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *"dist"* ]]; then
        continue
    fi
    
    # Update imports for config
    fix_file "$file" "_API_CONFIG" "API_CONFIG"
    fix_file "$file" "_APP_CONFIG" "APP_CONFIG"
    fix_file "$file" "_QUERY_KEYS" "QUERY_KEYS"
    fix_file "$file" "_SHARED_CONFIG" "SHARED_CONFIG"
    fix_file "$file" "_getAuthHeaders" "getAuthHeaders"
    fix_file "$file" "_hasRole" "hasRole"
    fix_file "$file" "_formatApiEndpoint" "formatApiEndpoint"
    
    # Update imports for constants
    fix_file "$file" "_ORIGENES_DESTINOS" "ORIGENES_DESTINOS"
    fix_file "$file" "_DESPACHANTES" "DESPACHANTES"
    fix_file "$file" "_ESTADO_PRECINTO" "ESTADO_PRECINTO"
    fix_file "$file" "_TIPO_PRECINTO" "TIPO_PRECINTO"
    fix_file "$file" "_ESTADO_ESLINGA" "ESTADO_ESLINGA"
done

echo ""
echo "3. Fixing specific parameter issues..."

# Fix unused parameters in specific files
fix_file "src/features/alertas/components/AlertsTableAnimated.tsx" "loading: _loading" "loading"
fix_file "src/features/alertas/components/AlertsTableV2.tsx" "_motivoId" "motivoId"
fix_file "src/features/alertas/components/AlertsTableV2.tsx" "_motivoDescripcion" "motivoDescripcion"
fix_file "src/features/alertas/components/AlertsTableV2.tsx" "_observaciones" "observaciones"

# Fix api.service.ts parameters
fix_file "src/services/api.service.ts" "_filtros" "filtros"
fix_file "src/services/api.service.ts" "_id:" "id:"
fix_file "src/services/api.service.ts" "_precintoId" "precintoId"
fix_file "src/services/api.service.ts" "_limit" "limit"
fix_file "src/services/api.service.ts" "_activas" "activas"
fix_file "src/services/api.service.ts" "_horas" "horas"

# Fix trokor.config.ts parameters
fix_file "src/config/trokor.config.ts" "_id:" "id:"
fix_file "src/config/trokor.config.ts" "_nqr:" "nqr:"
fix_file "src/config/trokor.config.ts" "_precintoId:" "precintoId:"
fix_file "src/config/trokor.config.ts" "_endpoint" "endpoint"
fix_file "src/config/trokor.config.ts" "_base" "base"
fix_file "src/config/trokor.config.ts" "_token" "token"

# Fix logger middleware parameters
fix_file "src/store/middleware/logger.ts" "_options?" "options?"

echo ""
echo "4. Summary:"
echo "   - Configuration exports have been renamed"
echo "   - Imports have been updated across the codebase"
echo "   - Common parameter underscore prefixes have been fixed"
echo ""
echo "Backup created in: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Run 'npm run lint' to check for linting issues"
echo "2. Run 'npx tsc --noEmit' to check for TypeScript errors"
echo "3. Manually review and fix any remaining underscore-prefixed parameters"
echo ""
echo "Note: Some function parameters with underscores may need manual review,"
echo "especially if they are intentionally unused (in which case, use _ alone)."