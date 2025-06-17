export interface Deposito {
  id: string;
  codigo: number;
  nombre: string;
  alias: string;
  lat: number;
  lng: number;
  padre: string;
  tipo: string;
  zona: string;
  empresa?: string;
  capacidad: number;
  transitosActivos: number;
  estado: 'activo' | 'inactivo';
  telefono?: string;
  direccion?: string;
  horaApertura?: string;
  horaCierre?: string;
  precintosActivos?: number;
}

export interface DepositoFilters {
  tipo: string;
  zona: string;
  padre: string;
}

export const DEPOSITO_TIPOS = [
  'Terminal Portuaria',
  'Zona Franca',
  'Depósito Privado',
  'Control Integrado',
  'Puerto',
  'Aeropuerto'
] as const;

export const DEPOSITO_ZONAS = [
  'Puerto',
  'ZF Florida',
  'ZF Libertad',
  'Aeropuerto',
  'Chuy',
  'Rio Branco',
  'Rivera',
  'Fray Bentos',
  'Colonia',
  'Punta del Este',
  'Acegua',
  'Artigas',
  'Bella Union',
  'Salto',
  'Paysandu',
  'Nueva Palmira',
  'Pta Pereira',
  'ZF Carrasco',
  'Juan Lacaze',
  'ZF Nueva Helvecia',
  'M\' Bopicua',
  'Oficina',
  'Service',
  'En Viaje',
  'Tacuarembo',
  'Encomienda'
] as const;