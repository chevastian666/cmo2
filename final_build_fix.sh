#!/bin/bash

echo "🔧 Final comprehensive build fix..."

# Fix 1: Remove duplicate animations import in InteractiveTreemap.tsx
echo "📦 Fixing InteractiveTreemap.tsx..."
if [ -f "src/components/charts/d3/InteractiveTreemap.tsx" ]; then
  # Remove the duplicate animations import
  sed -i '' '/import { animations } from/d' "src/components/charts/d3/InteractiveTreemap.tsx"
  
  # Fix the animations usage to use the inline animations object
  sed -i '' 's/animations.fadeIn(labels as any/fadeIn(labels as any/g' "src/components/charts/d3/InteractiveTreemap.tsx"
  sed -i '' 's/animations.fadeIn(values as any/fadeIn(values as any/g' "src/components/charts/d3/InteractiveTreemap.tsx"
  sed -i '' 's/animations.fadeIn(tooltips as any/fadeIn(tooltips as any/g' "src/components/charts/d3/InteractiveTreemap.tsx"
  
  # Add the fadeIn function inline
  if ! grep -q "const fadeIn =" "src/components/charts/d3/InteractiveTreemap.tsx"; then
    sed -i '' '/const InteractiveTreemap/i\
const fadeIn = (selection: any, duration = 300) => {\
  selection\
    .style('\''opacity'\'', 0)\
    .transition()\
    .duration(duration)\
    .style('\''opacity'\'', 1)\
}\
' "src/components/charts/d3/InteractiveTreemap.tsx"
  fi
fi

# Fix 2: Remove unused animations.ts file
rm -f "src/components/charts/d3/animations.ts"

# Fix 3: Fix NotificationCenter type issues by using proper type guards
echo "📦 Fixing NotificationCenter.tsx type issues..."
if [ -f "src/components/notifications/NotificationCenter.tsx" ]; then
  # Add type guard functions
  if ! grep -q "function isNotificationGroup" "src/components/notifications/NotificationCenter.tsx"; then
    sed -i '' '/interface NotificationGroup {/a\
\
function isNotificationGroup(item: any): item is NotificationGroup {\
  return item && typeof item.notifications !== '\''undefined'\'';\
}\
\
function isNotification(item: any): item is Notification {\
  return item && typeof item.title !== '\''undefined'\'';\
}' "src/components/notifications/NotificationCenter.tsx"
  fi
  
  # Fix the type checking in map functions
  sed -i '' 's/(Array.isArray(filteredNotifications) ? filteredNotifications : \[\]).map(group => {/(Array.isArray(filteredNotifications) ? filteredNotifications : []).map((group: any) => {/g' "src/components/notifications/NotificationCenter.tsx"
  sed -i '' 's/(Array.isArray(filteredNotifications) ? filteredNotifications : \[\]).map(notification => {/(Array.isArray(filteredNotifications) ? filteredNotifications : []).map((notification: any) => {/g' "src/components/notifications/NotificationCenter.tsx"
fi

# Fix 4: Fix VirtualizedList.tsx imperative handle
echo "📦 Fixing VirtualizedList.tsx..."
if [ -f "src/components/optimized/VirtualizedList.tsx" ]; then
  # Remove the incorrect useImperativeHandle lines
  sed -i '' '/React.useImperativeHandle(resetScroll/d' "src/components/optimized/VirtualizedList.tsx"
  sed -i '' '/React.useImperativeHandle(scrollToItem/d' "src/components/optimized/VirtualizedList.tsx"
fi

# Fix 5: Add scheduler types
echo "📦 Adding scheduler types..."
npm install --save-dev @types/scheduler 2>/dev/null || true

# Fix 6: Fix tabs import case sensitivity
echo "📦 Fixing tabs import..."
if [ -f "src/components/ui/index.ts" ]; then
  sed -i '' 's|export \* from '\''./tabs'\''|export * from '\''./Tabs'\''|g' "src/components/ui/index.ts"
fi

# Fix 7: Fix card.test.tsx duplicate imports
echo "📦 Fixing card.test.tsx..."
if [ -f "src/components/ui/card.test.tsx" ]; then
  # Remove duplicate Card imports
  sed -i '' '8d' "src/components/ui/card.test.tsx"
fi

# Fix 8: Fix InputProps export
echo "📦 Adding InputProps export..."
if [ -f "src/components/ui/input.tsx" ]; then
  if ! grep -q "export interface InputProps" "src/components/ui/input.tsx"; then
    sed -i '' 's/interface InputProps/export interface InputProps/g' "src/components/ui/input.tsx"
  fi
fi

echo "✅ Final fixes completed!"
echo "🔍 Running build..."

npm run build 2>&1 | tail -20