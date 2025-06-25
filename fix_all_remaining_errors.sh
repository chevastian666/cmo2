#!/bin/bash
# Comprehensive fix for all remaining TypeScript errors
# By Cheva

echo "=== Comprehensive TypeScript Error Fix ==="
echo ""

# Fix 1: Event handler 'e' parameter issue
echo "1. Fixing event handler 'e' parameter issues..."
# Fix pattern where (_e) => ... e.something
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/onChange={(_e) => \([a-zA-Z_]*\)(e\./onChange={(e) => \1(e./g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/onClick={(_e) => \([a-zA-Z_]*\)(e\./onClick={(e) => \1(e./g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/onSubmit={(_e) => \([a-zA-Z_]*\)(e\./onSubmit={(e) => \1(e./g' {} +
# More specific pattern for PrecintoSearchCompact
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/onChange={(_e) => setNqr(e\.target\.value)}/onChange={(e) => setNqr(e.target.value)}/g' {} +

# Fix 2: Remaining underscore variables
echo "2. Fixing remaining underscore variables..."
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/disabled={_loading}/disabled={loading}/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/setIsRefreshing(_true)/setIsRefreshing(true)/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/setIsRefreshing(_false)/setIsRefreshing(false)/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/useState(_false)/useState(false)/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/useState(_true)/useState(true)/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/useState(_null)/useState(null)/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/useRef(_null)/useRef(null)/g' {} +

# Fix 3: Handle event handler issues more thoroughly
echo "3. Fixing all event handler patterns..."
# Fix pattern where function parameter has underscore but body uses without
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec perl -i -pe 's/\((_\w+)\)\s*=>\s*\{([^}]*)\b\1\b/($1) => {$2$1/g' {} +
# Fix specific case of _e => ... e.
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec perl -i -pe 's/\(_e\)\s*=>\s*([^)]*)\be\./\(e\) => $1e./g' {} +

# Fix 4: Fix duplicate Card imports
echo "4. Removing duplicate imports..."
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec perl -i -pe '
  if (/^import.*Card.*from.*ui\/card/) {
    $seen_card = 1;
  }
  if (/^import.*Card.*from.*components\/ui[^\/]/ && $seen_card) {
    $_ = "";
  }
' {} +

# Fix 5: Variable reference fixes
echo "5. Fixing variable reference patterns..."
# Fix common destructuring issues
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/if (!transito\./if (!armadoData.transito./g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/if (transito\./if (armadoData.transito./g' {} +

# Fix 6: Missing type exports/imports
echo "6. Adding missing type exports..."
# Ensure Card is properly exported from components/ui
if ! grep -q "export.*Card" src/components/ui/index.ts 2>/dev/null; then
  echo "export { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card'" >> src/components/ui/index.ts
fi

echo ""
echo "=== Fixes applied! Checking remaining errors... ==="
npm run build 2>&1 | grep -E "error TS" | wc -l