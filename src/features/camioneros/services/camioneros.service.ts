import type { Camionero, TransitoCamionero, EstadisticasCamionero, FiltrosCamionero, MatriculaFrecuente } from '../types';
import { transitosService } from '../../transitos/services/transitos.service';
import { camionesService } from '../../camiones/services/camiones.service';

class CamionerosService {
  private camioneros: Map<string, Camionero> = new Map();

  constructor() {
    // Inicializar con algunos datos de ejemplo
    this.initMockData();
  }

  private initMockData() {
    const mockCamioneros: Camionero[] = [
      {
        id: '1',
        nombre: 'Juan',
        apellido: 'Pérez',
        documento: '12345678',
        tipoDocumento: 'CI',
        nacionalidad: 'Uruguay',
        paisOrigen: 'Uruguay',
        telefonoUruguayo: '099123456',
        comentario: 'Chofer de confianza, siempre puntual',
        fechaRegistro: new Date('2024-01-10'),
        fechaActualizacion: new Date('2024-12-20'),
        creadoPor: { id: '1', nombre: 'Admin' }
      },
      {
        id: '2',
        nombre: 'Carlos',
        apellido: 'González',
        documento: 'ARG987654',
        tipoDocumento: 'Pasaporte',
        nacionalidad: 'Argentina',
        paisOrigen: 'Argentina',
        telefonoUruguayo: '098765432',
        telefonoPais: '+541123456789',
        comentario: 'Suele llegar tarde en cruces fronterizos',
        fechaRegistro: new Date('2024-02-15'),
        fechaActualizacion: new Date('2024-12-18'),
        creadoPor: { id: '1', nombre: 'Admin' }
      },
      {
        id: '3',
        nombre: 'Pedro',
        apellido: 'Silva',
        documento: 'BRA456789',
        tipoDocumento: 'Pasaporte',
        nacionalidad: 'Brasil',
        paisOrigen: 'Brasil',
        telefonoUruguayo: '091234567',
        telefonoPais: '+5511987654321',
        comentario: 'Documentación siempre en regla',
        fechaRegistro: new Date('2024-03-20'),
        fechaActualizacion: new Date('2024-12-19'),
        creadoPor: { id: '2', nombre: 'Supervisor' }
      },
      {
        id: '4',
        nombre: 'Miguel',
        apellido: 'Rodríguez',
        documento: '87654321',
        tipoDocumento: 'CI',
        nacionalidad: 'Uruguay',
        paisOrigen: 'Uruguay',
        telefonoUruguayo: '094567890',
        comentario: 'Problemas anteriores con documentación',
        fechaRegistro: new Date('2024-04-05'),
        fechaActualizacion: new Date('2024-12-15'),
        creadoPor: { id: '2', nombre: 'Supervisor' }
      }
    ];

    mockCamioneros.forEach(camionero => {
      this.camioneros.set(camionero.documento, camionero);
    });
  }

  async getCamioneros(filtros?: FiltrosCamionero): Promise<Camionero[]> {
    let camioneros = Array.from(this.camioneros.values());

    if (filtros) {
      // Filtrar por búsqueda (nombre, apellido o documento)
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        camioneros = camioneros.filter(c => 
          c.nombre.toLowerCase().includes(busqueda) ||
          c.apellido.toLowerCase().includes(busqueda) ||
          c.documento.toLowerCase().includes(busqueda)
        );
      }

      // Filtrar por nacionalidad
      if (filtros.nacionalidad) {
        camioneros = camioneros.filter(c => c.nacionalidad === filtros.nacionalidad);
      }

      // Filtrar por tránsitos recientes
      if (filtros.conTransitosRecientes) {
        // Por ahora retornamos todos
        // En producción esto consultaría los tránsitos reales
      }
    }

    return camioneros.sort((a, b) => 
      b.fechaActualizacion.getTime() - a.fechaActualizacion.getTime()
    );
  }

  async getCamioneroByDocumento(documento: string): Promise<Camionero | null> {
    return this.camioneros.get(documento) || null;
  }

  async getCamioneroById(id: string): Promise<Camionero | null> {
    return Array.from(this.camioneros.values()).find(c => c.id === id) || null;
  }

  async getTransitosCamionero(documento: string, limit: number = 10): Promise<TransitoCamionero[]> {
    // Obtener todos los tránsitos del sistema
    const todosTransitos = await transitosService.getTransitos();
    
    // Filtrar por documento del camionero
    const transitosCamionero = todosTransitos
      .filter(t => t.vehiculo?.conductor?.documento === documento)
      .slice(0, limit)
      .map(t => ({
        id: t.id,
        fecha: t.fechaInicio,
        matricula: t.vehiculo?.matricula || 'N/A',
        origen: t.origen,
        destino: t.destino,
        estado: t.estado,
        precinto: t.precintoId
      }));

    return transitosCamionero;
  }

  async getMatriculasFrecuentes(documento: string, limit: number = 5): Promise<MatriculaFrecuente[]> {
    const transitos = await this.getTransitosCamionero(documento, 100);
    
    // Contar matrículas
    const matriculaCount = new Map<string, { cantidad: number; ultimaFecha: Date }>();
    transitos.forEach(t => {
      const current = matriculaCount.get(t.matricula) || { cantidad: 0, ultimaFecha: new Date(0) };
      current.cantidad++;
      if (t.fecha > current.ultimaFecha) {
        current.ultimaFecha = t.fecha;
      }
      matriculaCount.set(t.matricula, current);
    });

    // Convertir a array y ordenar por frecuencia
    const matriculasFrecuentes: MatriculaFrecuente[] = [];
    for (const [matricula, data] of matriculaCount.entries()) {
      const camion = await camionesService.getCamionByMatricula(matricula);
      matriculasFrecuentes.push({
        matricula,
        cantidadViajes: data.cantidad,
        ultimoViaje: data.ultimaFecha,
        camion: camion ? {
          id: camion.id,
          estado: camion.estado,
          foto: camion.foto
        } : undefined
      });
    }

    return matriculasFrecuentes
      .sort((a, b) => b.cantidadViajes - a.cantidadViajes)
      .slice(0, limit);
  }

  async getEstadisticasCamionero(documento: string): Promise<EstadisticasCamionero> {
    const todosTransitos = await transitosService.getTransitos();
    const transitosCamionero = todosTransitos.filter(t => 
      t.vehiculo?.conductor?.documento === documento
    );
    
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const transitosRecientes = transitosCamionero.filter(t => t.fechaInicio > hace30Dias);

    // Obtener matrículas frecuentes
    const matriculasFrecuentes = await this.getMatriculasFrecuentes(documento);

    // Contar rutas frecuentes
    const rutasCount = new Map<string, number>();
    transitosCamionero.forEach(t => {
      const ruta = `${t.origen}-${t.destino}`;
      rutasCount.set(ruta, (rutasCount.get(ruta) || 0) + 1);
    });

    const rutasFrecuentes = Array.from(rutasCount.entries())
      .map(([ruta, cantidad]) => {
        const [origen, destino] = ruta.split('-');
        return { origen, destino, cantidad };
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    return {
      totalTransitos: transitosCamionero.length,
      transitosUltimos30Dias: transitosRecientes.length,
      matriculasFrecuentes,
      rutasFrecuentes
    };
  }

  async createCamionero(data: Omit<Camionero, 'id' | 'fechaRegistro' | 'fechaActualizacion'>): Promise<Camionero> {
    const camionero: Camionero = {
      ...data,
      id: Date.now().toString(),
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    };

    this.camioneros.set(camionero.documento, camionero);
    return camionero;
  }

  async updateCamionero(documento: string, data: Partial<Camionero>): Promise<Camionero | null> {
    const camionero = this.camioneros.get(documento);
    if (!camionero) return null;

    const updated = {
      ...camionero,
      ...data,
      documento: camionero.documento, // No permitir cambiar el documento
      fechaActualizacion: new Date()
    };

    this.camioneros.set(documento, updated);
    return updated;
  }
}

export const camionerosService = new CamionerosService();