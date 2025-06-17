import type { ProximoArribo, AlertaTV, TransitoCritico, ConfiguracionTV } from '../types';
import { transitosService } from '../../transitos/services/transitos.service';
import { alertasService } from '../../../services/alertas.service';

class ModoTvService {
  private configuracion: ConfiguracionTV = {
    puntoOperacion: undefined,
    mostrarTodos: true,
    sonidoAlertas: true,
    actualizacionSegundos: 10,
    columnas: 2
  };

  async getProximosArribos(limite: number = 15): Promise<ProximoArribo[]> {
    try {
      // Obtener todos los tránsitos en curso
      const transitos = await transitosService.getTransitos();
      const ahora = new Date();
      
      // Filtrar y mapear próximos arribos
      const arribos: ProximoArribo[] = transitos
        .filter(t => t.estado === 'en_viaje' && t.eta)
        .map(t => {
          const horaArribo = new Date(t.eta!);
          const minutosRestantes = Math.max(0, Math.floor((horaArribo.getTime() - ahora.getTime()) / 60000));
          
          // Determinar punto de operación basado en el destino
          let puntoOperacion = 'Otros';
          if (t.destino.includes('TCP') || t.destino.includes('Terminal Cuenca')) {
            puntoOperacion = 'TCP - Terminal Cuenca del Plata';
          } else if (t.destino.includes('Montecon')) {
            puntoOperacion = 'Montecon';
          } else if (t.destino.includes('Paso de los Toros')) {
            puntoOperacion = 'Paso de los Toros';
          } else if (t.destino.includes('Rivera')) {
            puntoOperacion = 'Rivera';
          } else if (t.destino.includes('Fray Bentos')) {
            puntoOperacion = 'Fray Bentos';
          }
          
          // Determinar estado semáforo
          let estado: 'verde' | 'amarillo' | 'rojo' = 'verde';
          if (t.alertas && t.alertas.length > 0) {
            estado = 'rojo';
          } else if (minutosRestantes < 30) {
            estado = 'amarillo';
          }
          
          return {
            id: t.id,
            matricula: t.matricula,
            chofer: t.chofer,
            origen: t.origen,
            destino: t.destino,
            puntoOperacion,
            horaEstimadaArribo: horaArribo,
            minutosRestantes,
            estado,
            distanciaKm: t.progreso ? Math.round((100 - t.progreso) * 2) : undefined
          };
        })
        // Filtrar por punto de operación si está configurado
        .filter(a => {
          if (this.configuracion.mostrarTodos || !this.configuracion.puntoOperacion) {
            return true;
          }
          return a.puntoOperacion === this.configuracion.puntoOperacion;
        })
        // Ordenar por tiempo de arribo
        .sort((a, b) => a.minutosRestantes - b.minutosRestantes)
        .slice(0, limite);
      
      return arribos;
    } catch (error) {
      console.error('Error obteniendo próximos arribos:', error);
      return this.getMockArribos();
    }
  }

  async getAlertasActivas(limite: number = 10): Promise<AlertaTV[]> {
    try {
      // En desarrollo o si hay error, usar mock data
      if (import.meta.env.DEV) {
        return this.getMockAlertas().slice(0, limite);
      }
      
      const alertas = await alertasService.getActivas();
      
      return alertas
        .map(a => {
          // Mapear tipo de alerta
          let tipo: AlertaTV['tipo'] = 'datos_incorrectos';
          if (a.tipo === 'violacion' || a.tipo === 'intrusion') {
            tipo = 'precinto_abierto';
          } else if (a.mensaje.includes('chofer') || a.mensaje.includes('conductor')) {
            tipo = 'chofer_no_identificado';
          } else if (a.mensaje.includes('punto') || a.mensaje.includes('ubicación')) {
            tipo = 'punto_equivocado';
          } else if (a.mensaje.includes('tiempo') || a.mensaje.includes('retraso')) {
            tipo = 'tiempo_excesivo';
          }
          
          // Determinar nivel
          let nivel: AlertaTV['nivel'] = 'bajo';
          if (a.severidad === 'critica') {
            nivel = 'critico';
          } else if (a.severidad === 'alta') {
            nivel = 'alto';
          } else if (a.severidad === 'media') {
            nivel = 'medio';
          }
          
          return {
            id: a.id,
            hora: new Date(a.timestamp),
            tipo,
            transitoAfectado: a.codigoPrecinto,
            descripcion: a.mensaje,
            nivel
          };
        })
        .slice(0, limite);
    } catch (error) {
      console.error('Error obteniendo alertas, usando datos mock:', error);
      return this.getMockAlertas().slice(0, limite);
    }
  }

  async getTransitosCriticos(limite: number = 4): Promise<TransitoCritico[]> {
    try {
      const transitos = await transitosService.getTransitos();
      const ahora = new Date();
      
      const criticos: TransitoCritico[] = [];
      
      // Buscar tránsitos con problemas
      transitos.forEach(t => {
        let problema: string | null = null;
        let nivel: TransitoCritico['nivel'] = 'bajo';
        let tiempoEnProblema = 0;
        
        // Verificar diferentes tipos de problemas
        if (t.estado === 'con_alerta' && t.alertas && t.alertas.length > 0) {
          problema = t.alertas[0];
          nivel = 'alto';
          tiempoEnProblema = 30; // Simulado
        } else if (t.estado === 'en_viaje' && t.eta) {
          const horaEstimada = new Date(t.eta);
          const minutosRetraso = Math.floor((ahora.getTime() - horaEstimada.getTime()) / 60000);
          
          if (minutosRetraso > 60) {
            problema = `Retraso de ${minutosRetraso} minutos`;
            nivel = minutosRetraso > 120 ? 'critico' : 'alto';
            tiempoEnProblema = minutosRetraso;
          }
        }
        
        if (problema) {
          criticos.push({
            id: t.id,
            matricula: t.matricula,
            chofer: t.chofer,
            origen: t.origen,
            destino: t.destino,
            problema,
            tiempoEnProblema,
            nivel,
            accionRequerida: nivel === 'critico' ? 'Contactar supervisor' : 'Monitorear'
          });
        }
      });
      
      // Ordenar por nivel de criticidad y limitar
      return criticos
        .sort((a, b) => {
          const niveles = { bajo: 0, medio: 1, alto: 2, critico: 3 };
          return niveles[b.nivel] - niveles[a.nivel];
        })
        .slice(0, limite);
    } catch (error) {
      console.error('Error obteniendo tránsitos críticos:', error);
      return this.getMockCriticos();
    }
  }

  // Mock data para desarrollo
  private getMockArribos(): ProximoArribo[] {
    const ahora = new Date();
    return [
      {
        id: '1',
        matricula: 'ABC 1234',
        chofer: 'Juan Pérez',
        origen: 'Montevideo',
        destino: 'TCP',
        puntoOperacion: 'TCP - Terminal Cuenca del Plata',
        horaEstimadaArribo: new Date(ahora.getTime() + 15 * 60000),
        minutosRestantes: 15,
        estado: 'amarillo',
        distanciaKm: 25
      },
      {
        id: '2',
        matricula: 'XYZ 5678',
        chofer: 'Carlos González',
        origen: 'Rivera',
        destino: 'Montecon',
        puntoOperacion: 'Montecon',
        horaEstimadaArribo: new Date(ahora.getTime() + 45 * 60000),
        minutosRestantes: 45,
        estado: 'verde',
        distanciaKm: 78
      },
      {
        id: '3',
        matricula: 'BRA 9012',
        chofer: 'Pedro Silva',
        origen: 'Chuy',
        destino: 'Paso de los Toros',
        puntoOperacion: 'Paso de los Toros',
        horaEstimadaArribo: new Date(ahora.getTime() + 120 * 60000),
        minutosRestantes: 120,
        estado: 'rojo',
        distanciaKm: 180
      }
    ];
  }

  private getMockAlertas(): AlertaTV[] {
    const ahora = new Date();
    return [
      {
        id: '1',
        hora: new Date(ahora.getTime() - 5 * 60000),
        tipo: 'precinto_abierto',
        transitoAfectado: 'TR-00123',
        descripcion: 'Precinto abierto sin autorización en Ruta 5 km 45',
        nivel: 'critico'
      },
      {
        id: '2',
        hora: new Date(ahora.getTime() - 15 * 60000),
        tipo: 'chofer_no_identificado',
        transitoAfectado: 'TR-00456',
        descripcion: 'Conductor no registrado en el sistema',
        nivel: 'alto'
      }
    ];
  }

  private getMockCriticos(): TransitoCritico[] {
    return [
      {
        id: '1',
        matricula: 'ARG 3456',
        chofer: 'Miguel Rodríguez',
        origen: 'Buenos Aires',
        destino: 'Montevideo',
        problema: 'Retraso de 180 minutos',
        tiempoEnProblema: 180,
        nivel: 'critico',
        accionRequerida: 'Contactar supervisor'
      },
      {
        id: '2',
        matricula: 'URY 7890',
        origen: 'Salto',
        destino: 'TCP',
        problema: 'Sin señal GPS por 2 horas',
        tiempoEnProblema: 120,
        nivel: 'alto',
        accionRequerida: 'Verificar último punto conocido'
      }
    ];
  }

  // Configuración
  setConfiguracion(config: Partial<ConfiguracionTV>) {
    this.configuracion = { ...this.configuracion, ...config };
  }

  getConfiguracion(): ConfiguracionTV {
    return this.configuracion;
  }
}

export const modoTvService = new ModoTvService();