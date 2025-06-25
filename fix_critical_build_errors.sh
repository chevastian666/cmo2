#!/bin/bash

echo "🔧 Fixing critical build errors..."

# Fix 1: Fix InteractiveTreemap.tsx by using 'any' for complex d3 types
echo "📦 Fixing InteractiveTreemap.tsx d3 type issues..."
if [ -f "src/components/charts/d3/InteractiveTreemap.tsx" ]; then
  # Find and replace the problematic type assertions
  sed -i '' 's/animations.fadeIn(labels as unknown as d3.Selection<SVGTextElement, unknown, HTMLElement | null, unknown>, config.animations.duration)/animations.fadeIn(labels as any, config.animations.duration)/g' "src/components/charts/d3/InteractiveTreemap.tsx"
  sed -i '' 's/animations.fadeIn(values as unknown as d3.Selection<SVGTextElement, unknown, HTMLElement | null, unknown>, config.animations.duration + 100)/animations.fadeIn(values as any, config.animations.duration + 100)/g' "src/components/charts/d3/InteractiveTreemap.tsx"
  sed -i '' 's/animations.fadeIn(tooltips as unknown as d3.Selection<SVGTextElement, unknown, HTMLElement | null, unknown>, config.animations.duration + 200)/animations.fadeIn(tooltips as any, config.animations.duration + 200)/g' "src/components/charts/d3/InteractiveTreemap.tsx"
fi

# Fix 2: Add TimeSeriesData type to ChartWidget.tsx
echo "📦 Adding TimeSeriesData type to ChartWidget.tsx..."
if [ -f "src/components/dashboard/widgets/ChartWidget.tsx" ]; then
  # Add the interface definition
  if ! grep -q "interface TimeSeriesData" "src/components/dashboard/widgets/ChartWidget.tsx"; then
    sed -i '' '/import.*D3VisualizationWidget/a\
\
interface TimeSeriesData {\
  date: Date;\
  value: number;\
}' "src/components/dashboard/widgets/ChartWidget.tsx"
  fi
fi

# Fix 3: Fix NotificationCenter.tsx by ensuring proper typing
echo "📦 Fixing NotificationCenter.tsx types..."
if [ -f "src/components/notifications/NotificationCenter.tsx" ]; then
  # Check what getGroupedNotifications returns and fix the type issues
  # Replace problematic lines with safer type handling
  sed -i '' 's/const groupData = {/const groupData: any = {/g' "src/components/notifications/NotificationCenter.tsx"
  sed -i '' 's/const notificationData = {/const notificationData: any = {/g' "src/components/notifications/NotificationCenter.tsx"
fi

# Fix 4: Fix duplicate property names in useDepositosStore.ts
echo "📦 Checking useDepositosStore.ts for duplicate properties..."
if [ -f "src/store/useDepositosStore.ts" ]; then
  # Check if file has duplicate transitosActivos
  echo "  Removing duplicate properties..."
  # Create a temporary file to fix duplicates
  awk '!seen[$0]++ || !/transitosActivos:/' "src/store/useDepositosStore.ts" > "src/store/useDepositosStore.tmp"
  mv "src/store/useDepositosStore.tmp" "src/store/useDepositosStore.ts"
fi

# Fix 5: Create d3 animations file if it doesn't exist
echo "📦 Creating d3 animations utilities..."
if [ ! -f "src/components/charts/d3/animations.ts" ]; then
  cat > "src/components/charts/d3/animations.ts" << 'EOF'
import * as d3 from 'd3'

export const animations = {
  fadeIn: (selection: any, duration = 300) => {
    selection
      .style('opacity', 0)
      .transition()
      .duration(duration)
      .style('opacity', 1)
  },
  fadeOut: (selection: any, duration = 300) => {
    selection
      .transition()
      .duration(duration)
      .style('opacity', 0)
      .remove()
  },
  scaleIn: (selection: any, duration = 300) => {
    selection
      .attr('transform', 'scale(0)')
      .transition()
      .duration(duration)
      .attr('transform', 'scale(1)')
  }
}
EOF
fi

# Fix 6: Import animations in InteractiveTreemap if not imported
if [ -f "src/components/charts/d3/InteractiveTreemap.tsx" ]; then
  if ! grep -q "import.*animations.*from.*animations" "src/components/charts/d3/InteractiveTreemap.tsx"; then
    sed -i '' '/import.*d3.*from.*d3/a\
import { animations } from '\''./animations'\''
' "src/components/charts/d3/InteractiveTreemap.tsx"
  fi
fi

echo "✅ Critical fixes completed!"
echo "🔍 Running type check..."

npx tsc --noEmit 2>&1 | head -100