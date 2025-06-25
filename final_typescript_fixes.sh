#!/bin/bash
# Final comprehensive TypeScript error fixes
# By Cheva

echo "=== Final TypeScript Error Fixes ==="
echo ""

# Fix 1: Remaining underscore variables
echo "1. Fixing ALL remaining underscore variables..."
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/s_earchTerm/searchTerm/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/console.error.*_error/console.error(error/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/catch.*_error/catch (error/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_onClose\b/onClose/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_fileInputRef\b/fileInputRef/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_handleSubmit\b/handleSubmit/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_handleChange\b/handleChange/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_handleFileChange\b/handleFileChange/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_setIsOpen\b/setIsOpen/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_key\b/key/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_searchError\b/searchError/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_showConfirmModal\b/showConfirmModal/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_camionSeleccionado\b/camionSeleccionado/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_TIPOS_NOVEDAD\b/TIPOS_NOVEDAD/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_nuevoDestino\b/nuevoDestino/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_agregarDestino\b/agregarDestino/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_hours\b/hours/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_minutes\b/minutes/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\b_timelinePosition\b/timelinePosition/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/setShowFullImage(_false)/setShowFullImage(false)/g' {} +

# Fix 2: Fix destructuring in armadoData references
echo "2. Fixing armadoData references..."
# Already fixed most of these with armadoData.transito

# Fix 3: Fix event handler patterns more thoroughly  
echo "3. Fixing event handler patterns..."
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/onChange={(_e) => {$/onChange={(e) => {/g' {} +
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/onClick={(_e) => {$/onClick={(e) => {/g' {} +

# Fix 4: Fix specific component imports that were missed
echo "4. Fixing duplicate and missing imports..."
# Remove duplicate Card imports
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec perl -i -0pe 's/import \{ Card \} from.*\n.*import.*Card.*from.*components\/ui[^;]*;//g' {} +

# Fix 5: Fix specific undefined variables
echo "5. Fixing specific variable issues..."
# Fix variables that should come from destructuring
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bcamioneroSeleccionado\b/filtros.camioneroSeleccionado/g' {} +

echo ""
echo "=== All fixes applied! ==="
echo ""
echo "Final error count:"
npm run build 2>&1 | grep -E "error TS" | wc -l