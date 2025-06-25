#!/bin/bash

echo "Fixing duplicate imports..."

# Find and fix duplicate Card imports
grep -r "import { Card } from" src/ | grep -E "\.tsx?:" | cut -d: -f1 | while read file; do
  if grep -q "import { Card} from './card'" "$file"; then
    echo "Fixing duplicate Card import in $file"
    sed -i "" '/import { Card} from .\/card/d' "$file"
  fi
done

# Fix specific files with duplicate imports
sed -i "" '/^import { Card } from .@\/components\/ui\/card./d' src/components/ui/TransitCard.tsx 2>/dev/null || true

echo "Duplicate imports fixed!"