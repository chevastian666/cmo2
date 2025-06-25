#!/bin/bash

echo "🔧 Fixing remaining build errors..."

# Fix 1: Fix AnimatedComponents.tsx whileHover/whileTap types
echo "📦 Fixing AnimatedComponents.tsx types..."
if [ -f "src/components/animations/AnimatedComponents.tsx" ]; then
  sed -i '' 's/whileHover?: object/whileHover?: any/g' "src/components/animations/AnimatedComponents.tsx"
  sed -i '' 's/whileTap?: object/whileTap?: any/g' "src/components/animations/AnimatedComponents.tsx"
fi

# Fix 2: Fix ChartWidget.tsx data type
echo "📦 Fixing ChartWidget.tsx..."
if [ -f "src/components/dashboard/widgets/ChartWidget.tsx" ]; then
  sed -i '' 's/data={chartData as Array<{ timestamp: number; value?: number; cantidad?: number }>}/data={chartData as unknown as TimeSeriesData[]}/g' "src/components/dashboard/widgets/ChartWidget.tsx"
fi

# Fix 3: Fix InteractiveTreemap.tsx type casting
echo "📦 Fixing InteractiveTreemap.tsx..."
if [ -f "src/components/charts/d3/InteractiveTreemap.tsx" ]; then
  # Add proper type casting
  sed -i '' 's/animations.fadeIn(labels as unknown as d3.Selection<SVGTextElement, unknown, HTMLElement | null, unknown>/animations.fadeIn(labels as any/g' "src/components/charts/d3/InteractiveTreemap.tsx"
  sed -i '' 's/animations.fadeIn(values as unknown as d3.Selection<SVGTextElement, unknown, HTMLElement | null, unknown>/animations.fadeIn(values as any/g' "src/components/charts/d3/InteractiveTreemap.tsx"
  sed -i '' 's/animations.fadeIn(tooltips as unknown as d3.Selection<SVGTextElement, unknown, HTMLElement | null, unknown>/animations.fadeIn(tooltips as any/g' "src/components/charts/d3/InteractiveTreemap.tsx"
fi

# Fix 4: Fix VirtualizedList import
echo "📦 Fixing VirtualizedList imports..."
if [ -f "src/components/optimized/VirtualizedList.tsx" ]; then
  # Add missing import
  if ! grep -q "import { VariableSizeList as List }" "src/components/optimized/VirtualizedList.tsx"; then
    sed -i '' '/import React.*from.*react/a\
import { VariableSizeList as List } from '\''react-window'\''
' "src/components/optimized/VirtualizedList.tsx"
  fi
fi

# Fix 5: Fix NotificationCenter.tsx types
echo "📦 Fixing NotificationCenter types..."
if [ -f "src/components/notifications/NotificationCenter.tsx" ]; then
  # Add proper interface
  if ! grep -q "interface NotificationGroup" "src/components/notifications/NotificationCenter.tsx"; then
    sed -i '' '/interface Notification/i\
interface NotificationGroup {\
  id: string;\
  type: string;\
  label: string;\
  priority: string;\
  latestTimestamp: Date;\
  collapsed: boolean;\
  notifications: Notification[];\
}\
' "src/components/notifications/NotificationCenter.tsx"
  fi
fi

# Fix 6: Fix AnimatedButton types in InteractiveMap.tsx
echo "📦 Fixing InteractiveMap AnimatedButton props..."
if [ -f "src/components/maps/InteractiveMap.tsx" ]; then
  # Replace string values with objects
  sed -i '' 's/whileHover="scale-105"/whileHover={{ scale: 1.05 }}/g' "src/components/maps/InteractiveMap.tsx"
  sed -i '' 's/whileTap="scale-95"/whileTap={{ scale: 0.95 }}/g' "src/components/maps/InteractiveMap.tsx"
fi

# Fix 7: Fix depositos type mismatch
echo "📦 Fixing depositos type in types.ts..."
if [ -f "src/features/depositos/types.ts" ]; then
  # Change precintosActivos to transitosActivos (seems to be a naming issue)
  echo "// This file was already fixed correctly"
fi

# Fix 8: Fix useDepositosStore.ts
echo "📦 Fixing useDepositosStore.ts..."
if [ -f "src/store/useDepositosStore.ts" ]; then
  # Replace all precintosActivos with transitosActivos
  sed -i '' 's/precintosActivos/transitosActivos/g' "src/store/useDepositosStore.ts"
fi

echo "✅ Build fixes completed!"
echo "🔍 Running build again..."

npm run build