#!/bin/bash

echo "Fixing ESLint issues..."

# First, remove all @ts-nocheck comments
echo "Removing @ts-nocheck comments..."
find src/ -type f -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "^// @ts-nocheck" "$file"; then
    echo "Removing @ts-nocheck from $file"
    sed -i "" '/^\/\/ @ts-nocheck$/d' "$file"
  fi
done

# Fix the specific any type issues in AnimatedComponents.tsx
echo "Fixing AnimatedComponents.tsx..."
sed -i "" 's/whileHover?: any/whileHover?: { scale?: number; y?: number } | string/' src/components/animations/AnimatedComponents.tsx
sed -i "" 's/whileTap?: any/whileTap?: { scale?: number } | string/' src/components/animations/AnimatedComponents.tsx

# Fix the any type issues in NotificationCenter.tsx
echo "Fixing NotificationCenter.tsx..."
sed -i "" 's/groupBy(notifications, (n: any)/groupBy(notifications, (n: Notification)/' src/components/notifications/NotificationCenter.tsx
sed -i "" 's/.map((\[group, items\]: any)/\.map((\[group, items\]: \[string, Notification\[\]\])/' src/components/notifications/NotificationCenter.tsx

echo "ESLint fixes applied!"