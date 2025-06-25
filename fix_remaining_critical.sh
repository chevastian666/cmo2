#!/bin/bash

echo "🔧 Fixing remaining critical errors..."

# Fix 1: Fix InteractiveTreemap.tsx by using animations.fadeIn
echo "📦 Fixing InteractiveTreemap.tsx fadeIn usage..."
if [ -f "src/components/charts/d3/InteractiveTreemap.tsx" ]; then
  # Remove the unused fadeIn function
  sed -i '' '/^const fadeIn = /,/^}/d' "src/components/charts/d3/InteractiveTreemap.tsx"
  
  # Use animations.fadeIn instead
  sed -i '' 's/fadeIn(labels as any/animations.fadeIn(labels as any/g' "src/components/charts/d3/InteractiveTreemap.tsx"
  sed -i '' 's/fadeIn(values as any/animations.fadeIn(values as any/g' "src/components/charts/d3/InteractiveTreemap.tsx"
  sed -i '' 's/fadeIn(tooltips as any/animations.fadeIn(tooltips as any/g' "src/components/charts/d3/InteractiveTreemap.tsx"
fi

# Fix 2: Remove unused functions in NotificationCenter.tsx
echo "📦 Removing unused functions in NotificationCenter.tsx..."
if [ -f "src/components/notifications/NotificationCenter.tsx" ]; then
  # Remove the unused type guard functions
  sed -i '' '/^function isNotificationGroup/,/^}/d' "src/components/notifications/NotificationCenter.tsx"
  sed -i '' '/^function isNotification/,/^}/d' "src/components/notifications/NotificationCenter.tsx"
fi

# Fix 3: Remove unused functions in VirtualizedList.tsx
echo "📦 Removing unused functions in VirtualizedList.tsx..."
if [ -f "src/components/optimized/VirtualizedList.tsx" ]; then
  # Comment out unused functions
  sed -i '' 's/const resetScroll/\/\/ const resetScroll/g' "src/components/optimized/VirtualizedList.tsx"
  sed -i '' 's/const scrollToItem/\/\/ const scrollToItem/g' "src/components/optimized/VirtualizedList.tsx"
fi

# Fix 4: Fix card.test.tsx imports
echo "📦 Fixing card.test.tsx imports..."
if [ -f "src/components/ui/card.test.tsx" ]; then
  # Add missing imports
  sed -i '' 's/import { Card } from/import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from/g' "src/components/ui/card.test.tsx"
fi

# Fix 5: Add @types/node if missing
echo "📦 Ensuring all types are installed..."
npm install --save-dev @types/node @types/react @types/react-dom 2>/dev/null || true

echo "✅ Critical fixes completed!"
echo "🔍 Running build..."

npm run build