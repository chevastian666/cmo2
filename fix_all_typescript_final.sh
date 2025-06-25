#!/bin/bash

echo "🔧 Starting comprehensive TypeScript fixes..."

# Fix 1: Add missing Card component imports
echo "📦 Fixing Card component imports..."

# Files that need Card imports
files_needing_card_imports=(
  "src/features/depositos/pages/DepositosPageV2.tsx"
  "src/components/ui/ShadcnDemo.tsx"
  "src/features/torre-control/components/TransitoDetailModal.tsx"
  "src/features/dashboard/components/TransitoDetailModal.tsx"
)

for file in "${files_needing_card_imports[@]}"; do
  if [ -f "$file" ]; then
    echo "  Fixing imports in $file"
    
    # Check if file already has Card imports
    if ! grep -q "CardContent.*from.*@/components/ui/card" "$file"; then
      # Replace Card-only imports with full imports
      sed -i '' "s|import { Card } from '@/components/ui/card'|import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'|g" "$file"
      
      # Handle cases where Card is imported differently
      sed -i '' "s|import {_Card.*} from '@/components/ui/card'|import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'|g" "$file"
    fi
  fi
done

# Fix 2: Fix remaining underscore variables in DepositosPageV2.tsx
echo "🔧 Fixing underscore variables in DepositosPageV2.tsx..."

if [ -f "src/features/depositos/pages/DepositosPageV2.tsx" ]; then
  # Fix _Card references
  sed -i '' 's/_Card/Card/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  
  # Fix _Select references
  sed -i '' 's/_Select/Select/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  
  # Fix specific variable references that were missed
  sed -i '' 's/_filters/filters/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_activeFiltersCount/activeFiltersCount/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_filteredDepositos/filteredDepositos/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_loading/loading/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_handleView/handleView/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_handleEdit/handleEdit/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_handleAdd/handleAdd/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_handleSave/handleSave/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_handleExport/handleExport/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_expandedRows/expandedRows/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_setExpandedRows/setExpandedRows/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_toggleRowExpand/toggleRowExpand/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_clearFilters/clearFilters/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_deposito/deposito/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_data/data/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_index/index/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_i/i/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_v/v/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_acc/acc/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_id/id/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_padre/padre/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_markers/markers/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_marker/marker/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_true/true/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_false/false/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/s_electedDeposito/selectedDeposito/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/s_howDetail/showDetail/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/s_howForm/showForm/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_editingDeposito/editingDeposito/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_fadeInUp/fadeInUp/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/s_taggerItem/staggerItem/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  
  # Fix function parameter references
  sed -i '' 's/(_title, value, icon, color, trend )/({ title, value, icon, color, trend })/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_title/title/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_value/value/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_icon/icon/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  sed -i '' 's/_trend/trend/g' "src/features/depositos/pages/DepositosPageV2.tsx"
fi

# Fix 3: Add missing imports for undefined variables
echo "📦 Adding missing imports..."

# Add missing animation variants imports
if [ -f "src/features/depositos/pages/DepositosPageV2.tsx" ]; then
  # Check if fadeInUp is imported
  if ! grep -q "fadeInUp" "src/features/depositos/pages/DepositosPageV2.tsx"; then
    # Add import after existing imports
    sed -i '' '/import.*AnimatedCard.*from.*AnimatedComponents/a\
import { fadeInUp, staggerItem } from '\''@/components/animations/variants'\''
' "src/features/depositos/pages/DepositosPageV2.tsx"
  fi
  
  # Add missing ChevronRight import
  if ! grep -q "ChevronRight" "src/features/depositos/pages/DepositosPageV2.tsx"; then
    sed -i '' 's/import { Plus, Search, Filter, Download, Building2, MapPin, Phone, Clock, Package, Edit2, Eye, X, Hash, Activity, Map}/import { Plus, Search, Filter, Download, Building2, MapPin, Phone, Clock, Package, Edit2, Eye, X, Hash, Activity, Map, ChevronRight}/g' "src/features/depositos/pages/DepositosPageV2.tsx"
  fi
  
  # Add missing depositos, updateDeposito, addDeposito imports
  if ! grep -q "useDepositosStore" "src/features/depositos/pages/DepositosPageV2.tsx"; then
    sed -i '' '/import.*InteractiveMap.*from.*InteractiveMap/a\
import { useDepositosStore } from '\''@/store/depositosStore'\''
' "src/features/depositos/pages/DepositosPageV2.tsx"
  fi
  
  # Add depositos extraction from store
  sed -i '' '/export const DepositosPageV2: React.FC = () => {/a\
  const { depositos, loading, updateDeposito, addDeposito } = useDepositosStore()
' "src/features/depositos/pages/DepositosPageV2.tsx"
fi

# Fix 4: Fix ShadcnDemo.tsx duplicate imports
echo "📦 Fixing duplicate imports in ShadcnDemo.tsx..."

if [ -f "src/components/ui/ShadcnDemo.tsx" ]; then
  # Remove duplicate imports
  sed -i '' '2d' "src/components/ui/ShadcnDemo.tsx"  # Remove line 2 (duplicate Select import)
  sed -i '' '3d' "src/components/ui/ShadcnDemo.tsx"  # Remove line 3 (duplicate Card import)
  
  # Fix AlertsPanel import
  if ! grep -q "import.*AlertsPanel" "src/components/ui/ShadcnDemo.tsx"; then
    sed -i '' '/import.*EditTransitoModalV2.*from/a\
import { AlertsPanel } from '\''../AlertsPanel'\''
' "src/components/ui/ShadcnDemo.tsx"
  fi
fi

# Fix 5: Fix TransitoDetailModal imports
echo "📦 Fixing TransitoDetailModal imports..."

# Torre control version
if [ -f "src/features/torre-control/components/TransitoDetailModal.tsx" ]; then
  # Add missing AlertsPanel import
  if ! grep -q "import.*AlertsPanel" "src/features/torre-control/components/TransitoDetailModal.tsx"; then
    sed -i '' '/import.*cn.*from.*utils/a\
import { AlertsPanel } from '\''@/components/ui/AlertsPanel'\''
' "src/features/torre-control/components/TransitoDetailModal.tsx"
  fi
  
  # Fix underscore references
  sed -i '' 's/_index/index/g' "src/features/torre-control/components/TransitoDetailModal.tsx"
fi

# Dashboard version
if [ -f "src/features/dashboard/components/TransitoDetailModal.tsx" ]; then
  # Fix CardHeader/CardContent imports
  if ! grep -q "CardContent" "src/features/dashboard/components/TransitoDetailModal.tsx"; then
    sed -i '' "s|import { Card } from '@/components/ui/card'|import { Card, CardContent, CardHeader } from '@/components/ui/card'|g" "src/features/dashboard/components/TransitoDetailModal.tsx"
  fi
fi

# Fix 6: Create missing animation variants file if needed
if [ ! -f "src/components/animations/variants.ts" ]; then
  echo "📝 Creating animation variants file..."
  cat > "src/components/animations/variants.ts" << 'EOF'
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1 }
  }),
  exit: { opacity: 0, y: -20 }
}

export const staggerItem = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

export const slideIn = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
}
EOF
fi

# Fix 7: Create missing depositos store if needed
if [ ! -f "src/store/depositosStore.ts" ]; then
  echo "📝 Creating depositos store..."
  cat > "src/store/depositosStore.ts" << 'EOF'
import { create } from 'zustand'
import type { Deposito } from '@/features/depositos/types'

interface DepositosStore {
  depositos: Deposito[]
  loading: boolean
  error: string | null
  fetchDepositos: () => Promise<void>
  updateDeposito: (id: string, data: Partial<Deposito>) => void
  addDeposito: (deposito: Omit<Deposito, 'id'>) => void
}

export const useDepositosStore = create<DepositosStore>((set) => ({
  depositos: [],
  loading: false,
  error: null,
  
  fetchDepositos: async () => {
    set({ loading: true, error: null })
    try {
      // Mock data for now
      const mockDepositos: Deposito[] = []
      set({ depositos: mockDepositos, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch depositos', loading: false })
    }
  },
  
  updateDeposito: (id, data) => {
    set((state) => ({
      depositos: state.depositos.map(d => d.id === id ? { ...d, ...data } : d)
    }))
  },
  
  addDeposito: (deposito) => {
    set((state) => ({
      depositos: [...state.depositos, { ...deposito, id: Date.now().toString() }]
    }))
  }
}))
EOF
fi

# Fix 8: Create missing deposito types if needed
if [ ! -f "src/features/depositos/types.ts" ]; then
  echo "📝 Creating deposito types..."
  cat > "src/features/depositos/types.ts" << 'EOF'
export interface Deposito {
  id: string
  codigo: number
  nombre: string
  alias: string
  lat: number
  lng: number
  padre: string
  tipo: string
  zona: string
  empresa?: string
  transitosActivos: number
  capacidad: number
  estado: 'activo' | 'inactivo'
  telefono?: string
  direccion?: string
  horaApertura?: string
  horaCierre?: string
}

export interface DepositoFilters {
  tipo: string
  zona: string
  padre: string
}
EOF
fi

# Fix 9: Fix any remaining type casting issues
echo "🔧 Fixing type casting issues..."

# Fix type casting for Select components
find src -name "*.tsx" -type f -exec sed -i '' 's/onValueChange={(_v: unknown) => /onValueChange={(v: string) => /g' {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/onValueChange={(_v) => /onValueChange={(v) => /g' {} \;

echo "✅ All TypeScript fixes completed!"
echo "🔍 Running type check..."

# Run TypeScript check
npx tsc --noEmit

echo "📊 Final error count:"
npx tsc --noEmit 2>&1 | grep -E "TS[0-9]+" | cut -d':' -f1 | sort | uniq -c | sort -nr