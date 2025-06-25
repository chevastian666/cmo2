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

export const DEPOSITO_TIPOS = [
  { value: 'deposito', label: 'Depósito' },
  { value: 'puerto', label: 'Puerto' },
  { value: 'aeropuerto', label: 'Aeropuerto' },
  { value: 'frontera', label: 'Frontera' }
]

export const DEPOSITO_ZONAS = [
  { value: 'norte', label: 'Norte' },
  { value: 'sur', label: 'Sur' },
  { value: 'este', label: 'Este' },
  { value: 'oeste', label: 'Oeste' },
  { value: 'centro', label: 'Centro' }
]
