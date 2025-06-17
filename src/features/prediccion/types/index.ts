export interface CongestionAnalysis {
  destino: string;
  ventanaInicio: Date;
  ventanaFin: Date;
  camiones: CamionProyectado[];
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  cantidadCamiones: number;
}

export interface CamionProyectado {
  id: string;
  matricula: string;
  eta: Date;
  origen: string;
  chofer: string;
}

export interface ProyeccionPorHora {
  hora: string;
  destinos: {
    nombre: string;
    cantidad: number;
    camiones: CamionProyectado[];
  }[];
}

export interface ConfiguracionPrediccion {
  ventanaTiempo: number; // minutos (default: 15)
  umbralBajo: number; // cantidad camiones (default: 3)
  umbralMedio: number; // cantidad camiones (default: 5)
  umbralAlto: number; // cantidad camiones (default: 8)
  destinosMonitoreados: string[];
  horasProyeccion: number; // cuántas horas hacia adelante proyectar (default: 1)
}

export const CONFIGURACION_DEFAULT: ConfiguracionPrediccion = {
  ventanaTiempo: 15,
  umbralBajo: 3,
  umbralMedio: 5,
  umbralAlto: 8,
  destinosMonitoreados: ['TCP', 'Montecon', 'Montevideo', 'Rivera', 'Chuy'],
  horasProyeccion: 1
};