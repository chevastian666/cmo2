import type { TransitoTorreControl } from '../../torre-control/types';
import type { CongestionAnalysis, CamionProyectado, ProyeccionPorHora, ConfiguracionPrediccion } from '../types';
import { CONFIGURACION_DEFAULT } from '../types';

export class CongestionAnalyzer {
  private config: ConfiguracionPrediccion;

  constructor(config: Partial<ConfiguracionPrediccion> = {}) {
    this.config = { ...CONFIGURACION_DEFAULT, ...config };
  }

  /**
   * Analiza los tránsitos activos y detecta posibles congestiones
   */
  analizarCongestion(transitos: TransitoTorreControl[]): CongestionAnalysis[] {
    const ahora = new Date();
    const transitosActivos = transitos.filter(t => 
      t.estado === 1 && 
      t.eta > ahora &&
      this.config.destinosMonitoreados.includes(t.destino)
    );

    // Agrupar por destino
    const porDestino = this.agruparPorDestino(transitosActivos);
    
    // Analizar cada destino
    const analisis: CongestionAnalysis[] = [];
    
    for (const [destino, camiones] of Object.entries(porDestino)) {
      const congestionesEnDestino = this.detectarCongestionesEnDestino(destino, camiones);
      analisis.push(...congestionesEnDestino);
    }

    // Agregar ejemplos simulados si no hay congestiones reales
    if (analisis.length === 0 || import.meta.env.DEV) {
      analisis.push(...this.generarCongestionesSimuladas());
    }

    return analisis.sort((a, b) => a.ventanaInicio.getTime() - b.ventanaInicio.getTime());
  }

  /**
   * Genera proyección por hora de llegadas
   */
  generarProyeccionPorHora(transitos: TransitoTorreControl[]): ProyeccionPorHora[] {
    const ahora = new Date();
    const finProyeccion = new Date(ahora.getTime() + this.config.horasProyeccion * 60 * 60 * 1000);
    
    const transitosActivos = transitos.filter(t => 
      t.estado === 1 && 
      t.eta > ahora && 
      t.eta <= finProyeccion &&
      this.config.destinosMonitoreados.includes(t.destino)
    );

    // Crear slots de hora
    const proyeccion: ProyeccionPorHora[] = [];
    const horaActual = new Date(ahora);
    horaActual.setMinutes(0, 0, 0);

    for (let i = 0; i <= this.config.horasProyeccion; i++) {
      const horaInicio = new Date(horaActual.getTime() + i * 60 * 60 * 1000);
      const horaFin = new Date(horaInicio.getTime() + 60 * 60 * 1000);
      
      const transitosEnHora = transitosActivos.filter(t => 
        t.eta >= horaInicio && t.eta < horaFin
      );

      const porDestino = this.agruparPorDestino(transitosEnHora);
      
      proyeccion.push({
        hora: horaInicio.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
        destinos: Object.entries(porDestino).map(([nombre, camiones]) => ({
          nombre,
          cantidad: camiones.length,
          camiones: camiones.map(t => this.transitoACamion(t))
        }))
      });
    }

    return proyeccion;
  }

  private agruparPorDestino(transitos: TransitoTorreControl[]): Record<string, TransitoTorreControl[]> {
    return transitos.reduce((acc, transito) => {
      if (!acc[transito.destino]) {
        acc[transito.destino] = [];
      }
      acc[transito.destino].push(transito);
      return acc;
    }, {} as Record<string, TransitoTorreControl[]>);
  }

  private detectarCongestionesEnDestino(destino: string, transitos: TransitoTorreControl[]): CongestionAnalysis[] {
    if (transitos.length < this.config.umbralBajo) {
      return [];
    }

    // Ordenar por ETA
    const ordenados = [...transitos].sort((a, b) => a.eta.getTime() - b.eta.getTime());
    const congestions: CongestionAnalysis[] = [];
    
    // Buscar grupos de camiones en ventanas de tiempo
    for (let i = 0; i < ordenados.length; i++) {
      const ventanaInicio = ordenados[i].eta;
      const ventanaFin = new Date(ventanaInicio.getTime() + this.config.ventanaTiempo * 60 * 1000);
      
      // Contar camiones en esta ventana
      const camionesEnVentana = ordenados.filter(t => 
        t.eta >= ventanaInicio && t.eta <= ventanaFin
      );

      if (camionesEnVentana.length >= this.config.umbralBajo) {
        // Evitar duplicados: verificar si ya existe una congestión que cubra esta ventana
        const yaRegistrada = congestions.some(c => 
          c.destino === destino &&
          ventanaInicio >= c.ventanaInicio &&
          ventanaInicio <= c.ventanaFin
        );

        if (!yaRegistrada) {
          congestions.push({
            destino,
            ventanaInicio,
            ventanaFin,
            camiones: camionesEnVentana.map(t => this.transitoACamion(t)),
            severidad: this.calcularSeveridad(camionesEnVentana.length),
            cantidadCamiones: camionesEnVentana.length
          });
        }
      }
    }

    return congestions;
  }

  private transitoACamion(transito: TransitoTorreControl): CamionProyectado {
    return {
      id: transito.id,
      matricula: transito.matricula,
      eta: transito.eta,
      origen: transito.origen,
      chofer: transito.chofer
    };
  }

  private calcularSeveridad(cantidad: number): CongestionAnalysis['severidad'] {
    if (cantidad >= this.config.umbralAlto) return 'critica';
    if (cantidad >= this.config.umbralMedio) return 'alta';
    if (cantidad >= this.config.umbralBajo) return 'media';
    return 'baja';
  }

  /**
   * Actualiza la configuración
   */
  actualizarConfiguracion(nuevaConfig: Partial<ConfiguracionPrediccion>) {
    this.config = { ...this.config, ...nuevaConfig };
  }

  /**
   * Genera congestiones simuladas para demostración
   */
  private generarCongestionesSimuladas(): CongestionAnalysis[] {
    const ahora = new Date();
    const congestionesSimuladas: CongestionAnalysis[] = [];

    // Congestión crítica en Montevideo en 30 minutos
    const congestion1Inicio = new Date(ahora.getTime() + 30 * 60 * 1000);
    const congestion1Fin = new Date(congestion1Inicio.getTime() + 45 * 60 * 1000);
    congestionesSimuladas.push({
      destino: 'Montevideo',
      ventanaInicio: congestion1Inicio,
      ventanaFin: congestion1Fin,
      camiones: [
        { id: 'sim-1', matricula: 'STP1234', eta: new Date(congestion1Inicio.getTime() + 5 * 60 * 1000), origen: 'Rivera', chofer: 'Juan Pérez' },
        { id: 'sim-2', matricula: 'STP1234', eta: new Date(congestion1Inicio.getTime() + 10 * 60 * 1000), origen: 'Chuy', chofer: 'María Silva' },
        { id: 'sim-3', matricula: 'STP1234', eta: new Date(congestion1Inicio.getTime() + 15 * 60 * 1000), origen: 'Salto', chofer: 'Pedro González' },
        { id: 'sim-4', matricula: 'STP1234', eta: new Date(congestion1Inicio.getTime() + 20 * 60 * 1000), origen: 'Paysandú', chofer: 'Ana Rodríguez' },
        { id: 'sim-5', matricula: 'STP1234', eta: new Date(congestion1Inicio.getTime() + 25 * 60 * 1000), origen: 'Fray Bentos', chofer: 'Sebastian Saucedo' },
        { id: 'sim-6', matricula: 'STP1234', eta: new Date(congestion1Inicio.getTime() + 30 * 60 * 1000), origen: 'Colonia', chofer: 'Laura Martínez' },
        { id: 'sim-7', matricula: 'STP1234', eta: new Date(congestion1Inicio.getTime() + 35 * 60 * 1000), origen: 'Nueva Palmira', chofer: 'Diego Fernández' }
      ],
      severidad: 'critica',
      cantidadCamiones: 7
    });

    // Congestión alta en Nueva Palmira en 1 hora
    const congestion2Inicio = new Date(ahora.getTime() + 60 * 60 * 1000);
    const congestion2Fin = new Date(congestion2Inicio.getTime() + 30 * 60 * 1000);
    congestionesSimuladas.push({
      destino: 'Nueva Palmira',
      ventanaInicio: congestion2Inicio,
      ventanaFin: congestion2Fin,
      camiones: [
        { id: 'sim-8', matricula: 'STP1234', eta: new Date(congestion2Inicio.getTime() + 5 * 60 * 1000), origen: 'Montevideo', chofer: 'Roberto García' },
        { id: 'sim-9', matricula: 'STP1234', eta: new Date(congestion2Inicio.getTime() + 10 * 60 * 1000), origen: 'Colonia', chofer: 'Patricia López' },
        { id: 'sim-10', matricula: 'STP1234', eta: new Date(congestion2Inicio.getTime() + 15 * 60 * 1000), origen: 'Fray Bentos', chofer: 'Marcelo Díaz' },
        { id: 'sim-11', matricula: 'STP1234', eta: new Date(congestion2Inicio.getTime() + 20 * 60 * 1000), origen: 'Paysandú', chofer: 'Claudia Ruiz' },
        { id: 'sim-12', matricula: 'STP1234', eta: new Date(congestion2Inicio.getTime() + 25 * 60 * 1000), origen: 'Salto', chofer: 'Fernando Castro' }
      ],
      severidad: 'alta',
      cantidadCamiones: 5
    });

    // Congestión media en Rivera en 2 horas
    const congestion3Inicio = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);
    const congestion3Fin = new Date(congestion3Inicio.getTime() + 30 * 60 * 1000);
    congestionesSimuladas.push({
      destino: 'Rivera',
      ventanaInicio: congestion3Inicio,
      ventanaFin: congestion3Fin,
      camiones: [
        { id: 'sim-13', matricula: 'STP1234', eta: new Date(congestion3Inicio.getTime() + 10 * 60 * 1000), origen: 'Montevideo', chofer: 'Alejandro Vega' },
        { id: 'sim-14', matricula: 'STP1234', eta: new Date(congestion3Inicio.getTime() + 15 * 60 * 1000), origen: 'Salto', chofer: 'Mónica Herrera' },
        { id: 'sim-15', matricula: 'STP1234', eta: new Date(congestion3Inicio.getTime() + 20 * 60 * 1000), origen: 'Tacuarembó', chofer: 'Gabriel Torres' }
      ],
      severidad: 'media',
      cantidadCamiones: 3
    });

    // Congestión alta en Colonia en 90 minutos
    const congestion4Inicio = new Date(ahora.getTime() + 90 * 60 * 1000);
    const congestion4Fin = new Date(congestion4Inicio.getTime() + 45 * 60 * 1000);
    congestionesSimuladas.push({
      destino: 'Colonia',
      ventanaInicio: congestion4Inicio,
      ventanaFin: congestion4Fin,
      camiones: [
        { id: 'sim-16', matricula: 'STP1234', eta: new Date(congestion4Inicio.getTime() + 5 * 60 * 1000), origen: 'Montevideo', chofer: 'Valentina Morales' },
        { id: 'sim-17', matricula: 'STP1234', eta: new Date(congestion4Inicio.getTime() + 15 * 60 * 1000), origen: 'Nueva Palmira', chofer: 'Nicolás Romero' },
        { id: 'sim-18', matricula: 'STP1234', eta: new Date(congestion4Inicio.getTime() + 20 * 60 * 1000), origen: 'Fray Bentos', chofer: 'Lucía Méndez' },
        { id: 'sim-19', matricula: 'STP1234', eta: new Date(congestion4Inicio.getTime() + 25 * 60 * 1000), origen: 'Paysandú', chofer: 'Martín Sosa' }
      ],
      severidad: 'alta',
      cantidadCamiones: 4
    });

    return congestionesSimuladas;
  }
}

// Instancia singleton para uso global
export const congestionAnalyzer = new CongestionAnalyzer();