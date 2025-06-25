#!/bin/bash
# Fix missing shadcn/ui imports
# By Cheva

echo "=== Fixing missing shadcn/ui imports ==="

# Function to add import if missing
add_import_if_missing() {
  local file=$1
  local component=$2
  local import_path=$3
  
  # Check if component is used in file
  if grep -q "<$component" "$file"; then
    # Check if import already exists
    if ! grep -q "import.*{.*$component.*}.*from.*['\"]$import_path['\"]" "$file"; then
      echo "  Adding $component import to $file"
      
      # Find the first import line
      first_import_line=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)
      
      if [ -n "$first_import_line" ]; then
        # Add import after other imports
        sed -i '' "${first_import_line}a\\
import { $component } from '$import_path'
" "$file"
      else
        # Add import at the beginning if no imports exist
        sed -i '' "1i\\
import { $component } from '$import_path'\\
" "$file"
      fi
    fi
  fi
}

# Fix Card imports
echo "1. Fixing Card imports..."
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "<Card" {} \; | while read file; do
  # Skip the card.tsx file itself
  if [[ "$file" != *"/ui/card.tsx" ]]; then
    add_import_if_missing "$file" "Card" "@/components/ui/card"
  fi
done

# Fix Select imports
echo "2. Fixing Select imports..."
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "<Select" {} \; | while read file; do
  # Skip the select.tsx file itself
  if [[ "$file" != *"/ui/select.tsx" ]]; then
    add_import_if_missing "$file" "Select" "@/components/ui/select"
  fi
done

# Fix other common shadcn/ui imports
echo "3. Fixing other common imports..."
components=("Button" "Input" "Label" "Dialog" "Badge" "Alert" "Tabs" "Form")
for comp in "${components[@]}"; do
  find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "<$comp" {} \; | while read file; do
    if [[ "$file" != *"/ui/"* ]]; then
      import_path="@/components/ui/${comp,,}"
      add_import_if_missing "$file" "$comp" "$import_path"
    fi
  done
done

echo ""
echo "=== Import fixes applied! ==="