#!/bin/bash
# Comprehensive script to fix TypeScript errors from underscore removal
# By Cheva

echo "=== Fixing TypeScript errors from underscore removal ==="
echo ""

# Fix 1: Event handler parameters where _e became e
echo "1. Fixing event handler parameters (_e) => e..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/(_e) => \([^e]\)/(_e) => \1/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/onChange={(_e) => \([a-zA-Z]\+\)(e\./onChange={(e) => \1(e./g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/onClick={(_e) => \([a-zA-Z]\+\)(e\./onClick={(e) => \1(e./g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/onSubmit={(_e) => \([a-zA-Z]\+\)(e\./onSubmit={(e) => \1(e./g' {} +

# Fix 2: Common variable patterns
echo "2. Fixing common undefined variables..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_loading\b/loading/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_error\b/error/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_data\b/data/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_handleSubmit\b/handleSubmit/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_value\b/value/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_onChange\b/onChange/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_isOpen\b/isOpen/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_isLoading\b/isLoading/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_onClose\b/onClose/g' {} +

# Fix 3: Specific patterns found in errors
echo "3. Fixing specific patterns..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_false\b/false/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_true\b/true/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_null\b/null/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\bs_earchTerm\b/searchTerm/g' {} +

# Fix 4: Variable references (common patterns)
echo "4. Fixing variable references..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_inputRef\b/inputRef/g' {} +
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/\b_nqr\b/nqr/g' {} +

echo ""
echo "=== Fixes applied! ==="
echo ""
echo "Now checking remaining TS2304 errors..."
npm run build 2>&1 | grep "TS2304" | wc -l