export type Role = 'God' | 'Gerente' | 'Supervisor' | 'CMO';

export type Section = 
  | 'dashboard'
  | 'transitos'
  | 'precintos'
  | 'alertas'
  | 'mapa'
  | 'prediccion'
  | 'torre-control'
  | 'depositos'
  | 'zonas-descanso'
  | 'roles'
  | 'configuracion';

export type Permission = 'view' | 'create' | 'edit' | 'delete';

export interface RolePermissions {
  [key: string]: Permission[];
}

export interface PermissionChange {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  role: Role;
  section: Section;
  oldPermissions: Permission[];
  newPermissions: Permission[];
  action: 'grant' | 'revoke';
}

export interface UserRole {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Section metadata for display
export const SECTION_LABELS: Record<Section, string> = {
  dashboard: 'Dashboard',
  transitos: 'Tránsitos',
  precintos: 'Precintos',
  alertas: 'Alertas',
  mapa: 'Mapa',
  prediccion: 'Predicción',
  'torre-control': 'Torre de Control',
  depositos: 'Depósitos',
  'zonas-descanso': 'Zonas de Descanso',
  roles: 'Gestión de Roles',
  configuracion: 'Configuración'
};

export const ROLE_LABELS: Record<Role, string> = {
  God: 'Administrador Total',
  Gerente: 'Gerente',
  Supervisor: 'Supervisor',
  CMO: 'Operador CMO'
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar'
};