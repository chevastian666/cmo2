#!/bin/bash

echo "Fixing missing exports..."

# Add missing exports to camioneros types
cat >> src/features/camioneros/types/index.ts << 'EOF'

export const TIPOS_DOCUMENTO = [
  { value: 'CI', label: 'Cédula de Identidad' },
  { value: 'Pasaporte', label: 'Pasaporte' },
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' }
]

export const NACIONALIDADES = [
  { value: 'UY', label: 'Uruguay' },
  { value: 'AR', label: 'Argentina' },
  { value: 'BR', label: 'Brasil' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'CL', label: 'Chile' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'PE', label: 'Perú' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'CO', label: 'Colombia' }
]
EOF

# Add missing exports to camiones types
cat >> src/features/camiones/types/index.ts << 'EOF'

export const ESTADOS_CAMION = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'mantenimiento', label: 'En Mantenimiento' }
]
EOF

# Add missing exports to prediccion types
cat >> src/features/prediccion/types/index.ts << 'EOF'

export const CONFIGURACION_DEFAULT = {
  umbralTiempo: 2,
  umbralVolumen: 50,
  ventanaAnalisis: 12,
  factorEstacionalidad: 1.2,
  puntosCriticos: []
}
EOF

echo "Missing exports fixed!"