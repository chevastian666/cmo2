export type TipoSubPanel = 'cliente' | 'punto_operacion'
export type PermisoSubPanel = 
  | 'ver_transitos_propios'      // Cliente: solo sus tránsitos
  | 'ver_transitos_punto'        // Punto: tránsitos dirigidos a su punto
  | 'ver_estados'                // Ver estados de tránsitos
  | 'ver_alertas'                // Ver alertas relacionadas
  | 'exportar_datos'             // Exportar información
  | 'ver_documentos';            // Ver documentos adjuntos

export interface SubPanel {
  id: string
  nombre: string
  email: string
  tipo: TipoSubPanel
  empresa?: string;              // Para clientes
  puntoOperacion?: string;       // Para funcionarios de punto
  permisos: PermisoSubPanel[]
  activo: boolean
  fechaCreacion: Date
  ultimoAcceso?: Date
  token?: string;                // Token de acceso único
  configuracion: {
    notificaciones: boolean
    emailAlertas: boolean
    limiteExportacion: number;   // Registros por exportación
    diasHistorico: number;       // Días de histórico permitidos
  }
}

export interface FiltrosSubPaneles {
  busqueda?: string
  tipo?: TipoSubPanel | ''
  activo?: boolean | ''
  puntoOperacion?: string
  empresa?: string
}

export interface EstadisticasSubPaneles {
  total: number
  activos: number
  porTipo: Record<TipoSubPanel, number>
  porPunto: Record<string, number>
  accesosHoy: number
  ultimosAccesos: {
    id: string
    nombre: string
    fecha: Date
  }[]
}