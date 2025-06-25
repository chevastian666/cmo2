#!/bin/bash
# Script to help fix undefined variable errors from underscore removal
# By Cheva

echo "Searching for common undefined variable patterns..."

# Common patterns from underscore removal
patterns=(
  "s_electedEmpresa:selectedEmpresa"
  "_empresa:empresa"
  "_onSubmit:onSubmit"
  "_disabled:disabled"
  "_handleSubmit:handleSubmit"
  "_data:data"
  "_onChange:onChange"
  "_value:value"
  "_loading:loading"
  "_error:error"
  "_isLoading:isLoading"
  "_isEmpty:isEmpty"
  "_isOpen:isOpen"
  "_setIsOpen:setIsOpen"
)

echo "Found patterns to fix:"
for pattern in "${patterns[@]}"; do
  IFS=':' read -r old new <<< "$pattern"
  echo "  $old -> $new"
  
  # Count occurrences
  count=$(grep -r "$old" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
  if [ $count -gt 0 ]; then
    echo "    Found $count occurrences"
  fi
done

echo ""
echo "To fix these automatically, uncomment the sed commands below and run again."
echo ""

# Uncomment to apply fixes
# for pattern in "${patterns[@]}"; do
#   IFS=':' read -r old new <<< "$pattern"
#   find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/\b$old\b/$new/g" {} +
# done

echo "Done!"