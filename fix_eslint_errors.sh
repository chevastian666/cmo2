#!/bin/bash

echo "🔧 Fixing ESLint errors..."

# Fix 1: Replace any with unknown or specific types
echo "📦 Fixing no-explicit-any errors..."

# AnimatedComponents.tsx
sed -i '' 's/d3.BaseType, any, SVGGElement, any/d3.BaseType, unknown, SVGGElement, unknown/g' "src/components/animations/AnimatedComponents.tsx"

# ChartWidget.tsx
sed -i '' 's/data: any\[\]/data: Array<{ timestamp: number; value?: number; cantidad?: number }>/g' "src/components/dashboard/widgets/ChartWidget.tsx"

# NotificationCenter.tsx - Fix all any types
sed -i '' 's/Record<string, any>/Record<string, unknown>/g' "src/components/notifications/NotificationCenter.tsx"
sed -i '' 's/preferences: any/preferences: NotificationPreferences/g' "src/components/notifications/NotificationCenter.tsx"

# VirtualizedList.tsx
sed -i '' 's/rowRenderer: (props: any) => any/rowRenderer: (props: ListRowProps) => React.ReactNode/g' "src/components/optimized/VirtualizedList.tsx"
sed -i '' 's/children?: any/children?: React.ReactNode/g' "src/components/optimized/VirtualizedList.tsx"

# Fix 2: Remove unused imports
echo "📦 Removing unused imports..."

# ShadcnDemo.tsx - Remove unused imports
sed -i '' 's/, CardFooter//g' "src/components/ui/ShadcnDemo.tsx"
sed -i '' '/import { AlertsPanel } from/d' "src/components/ui/ShadcnDemo.tsx"

# TransitoDetailModal.tsx files - Remove unused Card component imports
sed -i '' 's/, CardTitle, CardDescription, CardFooter//g' "src/features/dashboard/components/TransitoDetailModal.tsx"
sed -i '' 's/, CardTitle, CardDescription, CardFooter//g' "src/features/torre-control/components/TransitoDetailModal.tsx"

# Fix 3: Add underscore prefix to unused caught errors
echo "📦 Fixing unused caught errors..."

files_with_unused_errors=(
  "src/features/armado/pages/ArmadoWaitingPage.tsx"
  "src/features/novedades/components/FormularioNovedad.tsx"
  "src/features/novedades/components/LibroNovedades.tsx"
  "src/features/novedades/pages/BitacoraOperacional.tsx"
  "src/features/novedades/pages/LibroNovedadesPageV2.tsx"
  "src/services/jwt.service.ts"
  "src/services/shared/sharedWebSocket.service.ts"
  "src/store/depositosStore.ts"
  "src/store/novedadesStore.ts"
)

for file in "${files_with_unused_errors[@]}"; do
  if [ -f "$file" ]; then
    sed -i '' 's/} catch (error) {/} catch (_error) {/g' "$file"
  fi
done

# Fix 4: Fix missing dependencies in DepositosPageV2.tsx
echo "📦 Fixing React hooks dependencies..."

# Add depositos to the dependency arrays
sed -i '' 's/}, \[\])/}, [depositos])/g' "src/features/depositos/pages/DepositosPageV2.tsx"

# Fix unused index parameter
sed -i '' 's/(deposito, index)/(deposito, _index)/g' "src/features/depositos/pages/DepositosPageV2.tsx"

# Fix 5: Add missing types for VirtualizedList
if ! grep -q "interface ListRowProps" "src/components/optimized/VirtualizedList.tsx"; then
  sed -i '' '/import.*React.*from.*react/a\
\
interface ListRowProps {\
  index: number;\
  key: string;\
  parent: unknown;\
  style: React.CSSProperties;\
}' "src/components/optimized/VirtualizedList.tsx"
fi

# Fix 6: Add missing NotificationPreferences type
if ! grep -q "interface NotificationPreferences" "src/components/notifications/NotificationCenter.tsx"; then
  sed -i '' '/interface Notification {/i\
interface NotificationPreferences {\
  [key: string]: boolean | string | number;\
}\
' "src/components/notifications/NotificationCenter.tsx"
fi

echo "✅ ESLint fixes completed!"
echo "🔍 Running lint check..."

npm run lint